use axum::{
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fmt;

// ============================================================================
// SECTION 1: Core Handler Exports
// Resolves E0433 by explicitly exposing the handler modules to main.rs.
// ============================================================================
pub mod user_handler;
pub mod booking_handler;
// pub mod auth_handler; // (Uncomment if you maintain a separate auth handler alongside user_handler)

// ============================================================================
// SECTION 2: Global Error Handling Engine
// Safely wraps Rust errors into standard HTTP JSON responses. Prevents leaking
// PostgreSQL syntax errors to the client while logging them internally.
// ============================================================================
#[derive(Debug)]
pub enum AppError {
    Database(String),
    NotFound(String),
    Unauthorized(String),
    BadRequest(String),
    Internal(String),
}

// Map standard SQLx database errors automatically to our AppError
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        tracing::error!("Database exception: {:?}", err);
        match err {
            sqlx::Error::RowNotFound => AppError::NotFound("Requested resource was not found in the database.".into()),
            _ => AppError::Database("A critical database constraint or connection error occurred.".into()),
        }
    }
}

// Convert our AppError into a strictly formatted Axum JSON Response
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::Database(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        let body = Json(json!({
            "status": "error",
            "error": {
                "code": status.as_u16(),
                "message": error_message
            }
        }));

        (status, body).into_response()
    }
}

// ============================================================================
// SECTION 3: Standardized API Response Wrapper
// Wraps all successful handler outputs into a consistent JSend-compliant schema.
// ============================================================================
#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub status: &'static str,
    pub data: T,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            status: "success",
            data,
        }
    }
}

// ============================================================================
// SECTION 4: Pagination Extraction Engine
// Extracted automatically from request query parameters (e.g., /history?limit=20&page=1)
// to perform offset-based SQL queries in the booking handler.
// ============================================================================
#[derive(Deserialize, Debug, Clone)]
pub struct Pagination {
    pub limit: Option<i64>,
    pub page: Option<i64>,
}

impl Pagination {
    pub fn get_sql_limit_offset(&self) -> (i64, i64) {
        // Enforce strict limits to prevent DDoS via massive DB queries
        let limit = self.limit.unwrap_or(20).clamp(1, 100);
        let page = self.page.unwrap_or(1).max(1);
        let offset = (page - 1) * limit;
        
        (limit, offset)
    }
}

// ============================================================================
// SECTION 5: Telemetry Request ID Extractor
// Extracts Render/Cloudflare Request IDs for distributed tracing.
// ============================================================================
pub fn get_request_id(headers: &HeaderMap) -> String {
    if let Some(req_id) = headers.get("X-Request-Id") {
        if let Ok(id_str) = req_id.to_str() {
            return id_str.to_string();
        }
    }
    
    if let Some(cf_ray) = headers.get("CF-RAY") {
        if let Ok(ray_str) = cf_ray.to_str() {
            return ray_str.to_string();
        }
    }

    "unknown-trace-id".to_string()
}