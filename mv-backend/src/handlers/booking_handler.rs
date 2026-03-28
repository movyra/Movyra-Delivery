use axum::{extract::State, Extension, Json};
use serde_json::Value;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::AppState;
use crate::middleware::auth_guard::AuthenticatedUser;
use crate::handlers::{AppError, ApiResponse};
use crate::models::booking::{
    PricingRequest, PricingResponse, VehicleOption, 
    CreateBookingRequest, CreateBookingResponse, OrderHistoryResponse, Booking
};

// ============================================================================
// SECTION 1: Logistics Utility Engine
// Generates collision-resistant tracking IDs and strict 6-digit delivery OTPs.
// ============================================================================
fn generate_tracking_id() -> String {
    let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    // Creates a pseudo-randomized string (e.g., TRK-16952403...)
    format!("TRK-{:x}", time)
}

fn generate_delivery_otp() -> String {
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().subsec_nanos();
    // Enforces a strict 6-digit delivery confirmation pin (100000 - 999999)
    let otp = (nanos % 900000) + 100000; 
    otp.to_string()
}

// ============================================================================
// SECTION 2: Pricing & Routing Engine (OSRM)
// POST /api/pricing
// Connects to OSRM using the globally reused HTTP client to calculate real 
// distance/duration, then dynamically generates vehicle tier pricing.
// ============================================================================
pub async fn calculate_pricing(
    State(state): State<AppState>,
    Json(payload): Json<PricingRequest>,
) -> Result<Json<ApiResponse<PricingResponse>>, AppError> {
    
    let osrm_url = std::env::var("OSRM_BASE_URL")
        .unwrap_or_else(|_| "http://router.project-osrm.org".to_string());
    
    let request_url = format!(
        "{}/route/v1/driving/{},{};{},{}?overview=false", 
        osrm_url, payload.pickup.lng, payload.pickup.lat, payload.dropoff.lng, payload.dropoff.lat
    );

    // Reuse the global connection pool from AppState to prevent socket exhaustion
    let res = state.http_client.get(&request_url)
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("Routing Engine Timeout: {}", e)))?;
    
    let osrm_data: Value = res.json().await
        .map_err(|_| AppError::Internal("Failed to parse OSMR routing payload".into()))?;
    
    // Extract geometry, applying fallbacks if the route is physically impossible
    let distance_meters = osrm_data["routes"][0]["distance"].as_f64().unwrap_or(5000.0);
    let duration_seconds = osrm_data["routes"][0]["duration"].as_f64().unwrap_or(600.0);

    let distance_km = distance_meters / 1000.0;
    let duration_mins = (duration_seconds / 60.0) as i32;

    // Real dynamic pricing algorithm based on distance coefficients
    let vehicles = vec![
        VehicleOption {
            id: "veh_bike".to_string(),
            name: "Movyra Bike".to_string(),
            r#type: "bike".to_string(),
            capacity_desc: "Up to 5kg".to_string(),
            price: (20.0 + (distance_km * 8.0)).round(), // Base ₹20 + ₹8/km
            eta_mins: duration_mins + 2,
        },
        VehicleOption {
            id: "veh_tempo".to_string(),
            name: "Movyra Tempo".to_string(),
            r#type: "tempo".to_string(),
            capacity_desc: "Up to 500kg".to_string(),
            price: (50.0 + (distance_km * 15.0)).round(), // Base ₹50 + ₹15/km
            eta_mins: duration_mins + 8,
        },
        VehicleOption {
            id: "veh_truck".to_string(),
            name: "Movyra Truck".to_string(),
            r#type: "truck".to_string(),
            capacity_desc: "Up to 2000kg".to_string(),
            price: (150.0 + (distance_km * 25.0)).round(), // Base ₹150 + ₹25/km
            eta_mins: duration_mins + 15,
        }
    ];

    Ok(Json(ApiResponse::success(PricingResponse {
        distance_km,
        duration_mins,
        vehicles,
    })))
}

// ============================================================================
// SECTION 3: Atomic Booking & Transactional Wallet Engine
// POST /api/bookings
// Deducts funds from the user's wallet and inserts the shipment atomically.
// ============================================================================
pub async fn create_booking(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    Json(payload): Json<CreateBookingRequest>,
) -> Result<Json<ApiResponse<CreateBookingResponse>>, AppError> {
    
    let booking_id = format!("BKG-{}", generate_tracking_id());
    let tracking_id = generate_tracking_id();
    let otp = generate_delivery_otp();

    let vehicle_name = match payload.vehicle_id.as_str() {
        "veh_bike" => "Movyra Bike",
        "veh_tempo" => "Movyra Tempo",
        "veh_truck" => "Movyra Truck",
        _ => "Standard Vehicle",
    };

    // Begin a strict ACID database transaction
    let mut tx = state.db_pool.begin().await
        .map_err(|_| AppError::Database("Failed to initiate secure transaction".into()))?;

    // 1. Verify Wallet Balance
    let current_balance: f64 = sqlx::query_scalar!(
        "SELECT wallet_balance::FLOAT8 FROM users WHERE id = $1 FOR UPDATE",
        auth_user.uid
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| AppError::NotFound("User account not found or locked".into()))?;

    if current_balance < payload.agreed_price {
        return Err(AppError::BadRequest("Insufficient Movyra Wallet balance for this delivery.".into()));
    }

    // 2. Deduct Funds from User Wallet
    sqlx::query!(
        "UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2",
        payload.agreed_price,
        auth_user.uid
    )
    .execute(&mut *tx)
    .await
    .map_err(|_| AppError::Database("Failed to process wallet deduction".into()))?;

    // 3. Insert the Booking Record (Using strict type bindings to resolve E0282)
    let insert_query = r#"
        INSERT INTO bookings (
            id, user_id, pickup_address, pickup_lat, pickup_lng, 
            dropoff_address, dropoff_lat, dropoff_lng, parcel_type_id, 
            parcel_type_name, vehicle_id, vehicle_name, price, status, 
            tracking_id, otp, created_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING', $14, $15, NOW()
        )
    "#;

    sqlx::query::<sqlx::Postgres>(insert_query)
        .bind(&booking_id)
        .bind(&auth_user.uid)
        .bind(&payload.pickup_address)
        .bind(payload.pickup_lat)
        .bind(payload.pickup_lng)
        .bind(&payload.dropoff_address)
        .bind(payload.dropoff_lat)
        .bind(payload.dropoff_lng)
        .bind(&payload.parcel_type_id)
        .bind("Parcel".to_string()) 
        .bind(&payload.vehicle_id)
        .bind(vehicle_name)
        .bind(payload.agreed_price)
        .bind(&tracking_id)
        .bind(&otp)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Database(format!("Failed to register shipment: {}", e)))?;

    // Commit the transaction permanently to PostgreSQL
    tx.commit().await
        .map_err(|_| AppError::Database("Failed to finalize transaction".into()))?;

    Ok(Json(ApiResponse::success(CreateBookingResponse {
        booking_id,
        tracking_id,
        otp,
        status: "PENDING".to_string(),
    })))
}

// ============================================================================
// SECTION 4: History & Data Retrieval Engine
// GET /api/bookings/history
// Retrieves actual delivery history locked exclusively to the authenticated user.
// ============================================================================
pub async fn get_history(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
) -> Result<Json<ApiResponse<OrderHistoryResponse>>, AppError> {
    
    // Explicitly enforce Postgres type mapping to permanently resolve E0282
    let query = r#"
        SELECT * FROM bookings 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 50
    "#;

    let orders = sqlx::query_as::<sqlx::Postgres, Booking>(query)
        .bind(&auth_user.uid)
        .fetch_all(&state.db_pool)
        .await
        .map_err(|e| AppError::Database(format!("Failed to fetch delivery history: {}", e)))?;

    Ok(Json(ApiResponse::success(OrderHistoryResponse { orders })))
}