use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// ==============================================================================
// DATABASE MODELS
// ==============================================================================

/// Represents a Delivery Order in the PostgreSQL database.
/// Maps strictly to the `bookings` table.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Booking {
    pub id: String,
    pub user_id: String,
    
    pub pickup_address: String,
    pub pickup_lat: f64,
    pub pickup_lng: f64,
    
    pub dropoff_address: String,
    pub dropoff_lat: f64,
    pub dropoff_lng: f64,
    
    pub parcel_type_id: String,
    pub parcel_type_name: String,
    
    pub vehicle_id: String,
    pub vehicle_name: String,
    
    pub price: f64,
    
    /// PENDING, ACCEPTED, IN_TRANSIT, COMPLETED, CANCELLED
    pub status: String,
    
    /// Secure tracking identifier for WebSockets
    pub tracking_id: String,
    
    /// 4-digit verification code required to complete the delivery
    pub otp: String,
    
    /// ISO8601 Timestamp
    pub created_at: Option<String>,
}

// ==============================================================================
// HTTP REQUEST & RESPONSE MODELS
// ==============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct LocationInput {
    pub lat: f64,
    pub lng: f64,
}

/// Incoming JSON payload for `POST /api/pricing`
#[derive(Debug, Serialize, Deserialize)]
pub struct PricingRequest {
    pub pickup: LocationInput,
    pub dropoff: LocationInput,
    pub parcel_id: String,
}

/// Represents a calculated vehicle tier option returned to the frontend
#[derive(Debug, Serialize, Deserialize)]
pub struct VehicleOption {
    pub id: String,
    pub name: String,
    pub r#type: String, // 'bike', 'tempo', or 'truck'
    pub capacity_desc: String,
    pub price: f64,
    pub eta_mins: i32,
}

/// Outgoing JSON payload for `POST /api/pricing`
#[derive(Debug, Serialize, Deserialize)]
pub struct PricingResponse {
    pub distance_km: f64,
    pub duration_mins: i32,
    pub vehicles: Vec<VehicleOption>,
}

/// Incoming JSON payload for `POST /api/bookings`
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBookingRequest {
    pub pickup_address: String,
    pub pickup_lat: f64,
    pub pickup_lng: f64,
    
    pub dropoff_address: String,
    pub dropoff_lat: f64,
    pub dropoff_lng: f64,
    
    pub parcel_type_id: String,
    pub vehicle_id: String,
    pub agreed_price: f64,
}

/// Outgoing JSON payload for `POST /api/bookings`
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBookingResponse {
    pub booking_id: String,
    pub tracking_id: String,
    pub otp: String,
    pub status: String,
}

/// Outgoing JSON payload for `GET /api/bookings/history`
#[derive(Debug, Serialize, Deserialize)]
pub struct OrderHistoryResponse {
    pub orders: Vec<Booking>,
}