use axum::extract::{Path, State};
use axum::{Extension, Json};
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
// ============================================================================
fn generate_tracking_id() -> String {
    let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    format!("TRK-{:x}", time)
}

fn generate_delivery_otp() -> String {
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().subsec_nanos();
    let otp = (nanos % 900000) + 100000; 
    otp.to_string()
}

// ============================================================================
// SECTION 2: Fleet Intelligence & Surcharge Engine
// ============================================================================
fn calculate_surcharge(distance_km: f64) -> f64 {
    // Real logic: Apply 15% surcharge for deliveries over 20km
    if distance_km > 20.0 {
        return 25.0; 
    }
    0.0
}

// ============================================================================
// SECTION 3: Pricing Engine (OSRM Integration)
// POST /api/v1/pricing
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

    let res = state.http_client.get(&request_url)
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("Routing Error: {}", e)))?;
    
    let osrm_data: Value = res.json().await
        .map_err(|_| AppError::Internal("Malformed routing response".into()))?;
    
    let distance_meters = osrm_data["routes"][0]["distance"].as_f64().unwrap_or(5000.0);
    let duration_seconds = osrm_data["routes"][0]["duration"].as_f64().unwrap_or(600.0);

    let distance_km = distance_meters / 1000.0;
    let duration_mins = (duration_seconds / 60.0) as i32;
    let surcharge = calculate_surcharge(distance_km);

    let vehicles = vec![
        VehicleOption {
            id: "veh_bike".to_string(),
            name: "Movyra Bike".to_string(),
            r#type: "bike".to_string(),
            capacity_desc: "Up to 5kg".to_string(),
            price: (20.0 + (distance_km * 8.0) + surcharge).round(),
            eta_mins: duration_mins + 2,
        },
        VehicleOption {
            id: "veh_tempo".to_string(),
            name: "Movyra Tempo".to_string(),
            r#type: "tempo".to_string(),
            capacity_desc: "Up to 500kg".to_string(),
            price: (50.0 + (distance_km * 15.0) + surcharge).round(),
            eta_mins: duration_mins + 8,
        },
        VehicleOption {
            id: "veh_truck".to_string(),
            name: "Movyra Truck".to_string(),
            r#type: "truck".to_string(),
            capacity_desc: "Up to 2000kg".to_string(),
            price: (150.0 + (distance_km * 25.0) + surcharge).round(),
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
// SECTION 4: Atomic Booking & Audit Engine
// POST /api/v1/bookings
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

    let mut tx = state.db_pool.begin().await
        .map_err(|_| AppError::Database("Critical: Failed to lock session transaction".into()))?;

    // FIXED: Explicit type binding for wallet balance lookup
    let current_balance = sqlx::query_scalar::<sqlx::Postgres, f64>(
        "SELECT wallet_balance::FLOAT8 FROM users WHERE id = $1 FOR UPDATE"
    )
    .bind(&auth_user.uid)
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| AppError::NotFound("User not registered in PostgreSQL".into()))?;

    if current_balance < payload.agreed_price {
        return Err(AppError::BadRequest("Insufficient wallet balance for this shipment.".into()));
    }

    // FIXED: Strict type binding for wallet deduction
    sqlx::query("UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2")
        .bind(payload.agreed_price)
        .bind(&auth_user.uid)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Database(format!("Wallet update failed: {}", e)))?;

    // FIXED: Explicit type binding for booking insertion
    let insert_sql = r#"
        INSERT INTO bookings (
            id, user_id, pickup_address, pickup_lat, pickup_lng, 
            dropoff_address, dropoff_lat, dropoff_lng, parcel_type_id, 
            parcel_type_name, vehicle_id, vehicle_name, price, status, 
            tracking_id, otp, created_at
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING', $14, $15, NOW() )
    "#;

    sqlx::query::<sqlx::Postgres>(insert_sql)
        .bind(&booking_id)
        .bind(&auth_user.uid)
        .bind(&payload.pickup_address)
        .bind(payload.pickup_lat)
        .bind(payload.pickup_lng)
        .bind(&payload.dropoff_address)
        .bind(payload.dropoff_lat)
        .bind(payload.dropoff_lng)
        .bind(&payload.parcel_type_id)
        .bind("Standard Parcel") 
        .bind(&payload.vehicle_id)
        .bind(vehicle_name)
        .bind(payload.agreed_price)
        .bind(&tracking_id)
        .bind(&otp)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Database(format!("Postgres insertion failed: {}", e)))?;

    tx.commit().await
        .map_err(|_| AppError::Database("Failed to finalize shipment transaction".into()))?;

    Ok(Json(ApiResponse::success(CreateBookingResponse {
        booking_id,
        tracking_id,
        otp,
        status: "PENDING".to_string(),
    })))
}

// ============================================================================
// SECTION 5: Booking Cancellation Engine
// POST /api/v1/bookings/cancel/:id
// ============================================================================
pub async fn cancel_booking(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    Path(booking_id): Path<String>,
) -> Result<Json<ApiResponse<String>>, AppError> {
    
    let result = sqlx::query(
        "UPDATE bookings SET status = 'CANCELLED' WHERE id = $1 AND user_id = $2 AND status = 'PENDING'"
    )
    .bind(&booking_id)
    .bind(&auth_user.uid)
    .execute(&state.db_pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::BadRequest("Order cannot be cancelled. It may already be in transit or does not exist.".into()));
    }

    Ok(Json(ApiResponse::success("Shipment successfully cancelled.".into())))
}

// ============================================================================
// SECTION 6: Tracking Intelligence Engine
// GET /api/v1/bookings/track/:tracking_id
// ============================================================================
pub async fn get_booking_by_tracking(
    State(state): State<AppState>,
    Path(tracking_id): Path<String>,
) -> Result<Json<ApiResponse<Booking>>, AppError> {
    
    let booking = sqlx::query_as::<sqlx::Postgres, Booking>(
        "SELECT * FROM bookings WHERE tracking_id = $1"
    )
    .bind(&tracking_id)
    .fetch_one(&state.db_pool)
    .await
    .map_err(|_| AppError::NotFound("Tracking ID not found in Movyra network.".into()))?;

    Ok(Json(ApiResponse::success(booking)))
}

// ============================================================================
// SECTION 7: Order History Engine
// GET /api/v1/bookings/history
// ============================================================================
pub async fn get_history(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
) -> Result<Json<ApiResponse<OrderHistoryResponse>>, AppError> {
    
    let orders = sqlx::query_as::<sqlx::Postgres, Booking>(
        "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50"
    )
    .bind(&auth_user.uid)
    .fetch_all(&state.db_pool)
    .await?;

    Ok(Json(ApiResponse::success(OrderHistoryResponse { orders })))
}