use axum::{Json, Extension, http::StatusCode};
use serde_json::Value;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use crate::AppState;
use crate::models::booking::{
    PricingRequest, PricingResponse, VehicleOption, 
    CreateBookingRequest, CreateBookingResponse, OrderHistoryResponse, Booking
};

/// Helper to generate a unique tracking ID without external crates
fn generate_tracking_id() -> String {
    let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
    format!("TRK-{}", time)
}

/// Helper to generate a 4-digit OTP
fn generate_otp() -> String {
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().subsec_nanos();
    let otp = (nanos % 9000) + 1000; 
    otp.to_string()
}

/// POST /api/pricing
/// Connects to OSRM (Open Source Routing Machine) to calculate real distance and durations,
/// then applies business logic to generate vehicle pricing.
pub async fn calculate_pricing(Json(payload): Json<PricingRequest>) -> Result<Json<PricingResponse>, (StatusCode, String)> {
    let osrm_url = std::env::var("OSRM_BASE_URL").unwrap_or_else(|_| "http://router.project-osrm.org".to_string());
    
    // Construct real OSRM driving route request
    let request_url = format!(
        "{}/route/v1/driving/{},{};{},{}?overview=false", 
        osrm_url, payload.pickup.lng, payload.pickup.lat, payload.dropoff.lng, payload.dropoff.lat
    );

    let client = reqwest::Client::new();
    let res = client.get(&request_url)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Routing Engine Error: {}", e)))?;
    
    let osrm_data: Value = res.json().await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse routing data".to_string()))?;
    
    // Extract meters and seconds, fallback to defaults if route cannot be found
    let distance_meters = osrm_data["routes"][0]["distance"].as_f64().unwrap_or(5000.0);
    let duration_seconds = osrm_data["routes"][0]["duration"].as_f64().unwrap_or(600.0);

    let distance_km = distance_meters / 1000.0;
    let duration_mins = (duration_seconds / 60.0) as i32;

    // Real dynamic pricing logic based on distance and vehicle tier
    let vehicles = vec![
        VehicleOption {
            id: "veh_bike".to_string(),
            name: "Movyra Bike".to_string(),
            r#type: "bike".to_string(),
            capacity_desc: "Up to 5kg".to_string(),
            price: 20.0 + (distance_km * 8.0),
            eta_mins: duration_mins + 2,
        },
        VehicleOption {
            id: "veh_tempo".to_string(),
            name: "Movyra Tempo".to_string(),
            r#type: "tempo".to_string(),
            capacity_desc: "Up to 500kg".to_string(),
            price: 50.0 + (distance_km * 15.0),
            eta_mins: duration_mins + 8,
        },
        VehicleOption {
            id: "veh_truck".to_string(),
            name: "Movyra Truck".to_string(),
            r#type: "truck".to_string(),
            capacity_desc: "Up to 2000kg".to_string(),
            price: 150.0 + (distance_km * 25.0),
            eta_mins: duration_mins + 15,
        }
    ];

    Ok(Json(PricingResponse {
        distance_km,
        duration_mins,
        vehicles,
    }))
}

/// POST /api/bookings
/// Creates a real database record for the new delivery order.
pub async fn create_booking(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<CreateBookingRequest>,
) -> Result<Json<CreateBookingResponse>, (StatusCode, String)> {
    
    let booking_id = format!("BKG-{}", generate_tracking_id());
    let tracking_id = generate_tracking_id();
    let otp = generate_otp();

    // Map the incoming vehicle ID to a display name for the database
    let vehicle_name = match payload.vehicle_id.as_str() {
        "veh_bike" => "Movyra Bike",
        "veh_tempo" => "Movyra Tempo",
        "veh_truck" => "Movyra Truck",
        _ => "Standard Vehicle",
    };

    // Note: In a fully authenticated flow, user_id is extracted from the JWT Claims.
    // For structural integrity, we apply a placeholder user_id that will match the Firebase UID.
    let user_id = "USER_UID_PLACEHOLDER"; 

    // Insert into PostgreSQL via SQLx
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

    sqlx::query(insert_query)
        .bind(&booking_id)
        .bind(user_id)
        .bind(&payload.pickup_address)
        .bind(payload.pickup_lat)
        .bind(payload.pickup_lng)
        .bind(&payload.dropoff_address)
        .bind(payload.dropoff_lat)
        .bind(payload.dropoff_lng)
        .bind(&payload.parcel_type_id)
        .bind("Parcel".to_string()) // Map actual parcel name based on ID in production
        .bind(&payload.vehicle_id)
        .bind(vehicle_name)
        .bind(payload.agreed_price)
        .bind(&tracking_id)
        .bind(&otp)
        .execute(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database Insertion Failed: {}", e)))?;

    Ok(Json(CreateBookingResponse {
        booking_id,
        tracking_id,
        otp,
        status: "PENDING".to_string(),
    }))
}

/// GET /api/bookings/history
/// Retrieves actual delivery history from the PostgreSQL database.
pub async fn get_history(
    Extension(state): Extension<Arc<AppState>>,
) -> Result<Json<OrderHistoryResponse>, (StatusCode, String)> {
    
    let user_id = "USER_UID_PLACEHOLDER"; 

    // Fetch from database, ordered by newest first
    let query = r#"
        SELECT * FROM bookings 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 50
    "#;

    let orders = sqlx::query_as::<_, Booking>(query)
        .bind(user_id)
        .fetch_all(&state.db_pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to fetch history: {}", e)))?;

    Ok(Json(OrderHistoryResponse { orders }))
}