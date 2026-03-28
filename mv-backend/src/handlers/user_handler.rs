use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Extension, Json,
};
use serde::Serialize;
use sqlx::FromRow;
use crate::middleware::auth_guard::AuthenticatedUser;
use crate::AppState;

// ============================================================================
// SECTION 1: Data Transfer Objects (DTO) & Schema Definitions
// Defines the exact structure of the SQL data and the JSON returned to React.
// ============================================================================

#[derive(Debug, Serialize)]
pub struct UserSyncResponse {
    pub id: String,
    pub phone_number: String,
    pub name: Option<String>,
    pub wallet_balance: f64,
    pub is_new_user: bool,
    pub timezone: Option<String>,
}

#[derive(FromRow, Debug)]
pub struct UserRow {
    pub id: String,
    pub phone_number: String,
    pub name: Option<String>,
    pub wallet_balance: f64,
    // Converted to String to remove Chrono dependencies and simplify JSON serialization
    pub created_at: Option<String>, 
}

// ============================================================================
// SECTION 2: The Core Synchronization Engine
// The primary Axum endpoint called by the mobile app upon successful OTP.
// ============================================================================

pub async fn sync_user(
    State(state): State<AppState>, // Resolved E0277 by mapping to the correct global state
    Extension(auth_user): Extension<AuthenticatedUser>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    
    // Extract real telemetry data sent by our React apiClient.js
    let platform = headers
        .get("X-Platform")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("Unknown Mobile");
        
    let timezone = headers
        .get("X-Timezone")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("Asia/Kolkata");

    // ========================================================================
    // SECTION 3: First-Time Welcome Bonus Engine & User Upsert
    // Explicit runtime queries resolving E0282 type inference errors.
    // ========================================================================
    
    // 1. Check if the user already exists in PostgreSQL using their Firebase UID
    let query_str = r#"
        SELECT id, phone_number, name, wallet_balance::FLOAT8, created_at::TEXT 
        FROM users 
        WHERE id = $1
    "#;

    let existing_user = sqlx::query_as::<sqlx::Postgres, UserRow>(query_str)
        .bind(&auth_user.uid)
        .fetch_optional(&state.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Database query failed: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to query user database".to_string())
        })?;

    let is_new_user;
    let final_user;

    if let Some(user) = existing_user {
        // User exists. They are logging back in.
        is_new_user = false;
        final_user = user;
    } else {
        // User is completely new. 
        is_new_user = true;
        
        // Execute real INSERT provisioning a 50.00 INR welcome bonus to their wallet
        let insert_str = r#"
            INSERT INTO users (id, phone_number, wallet_balance) 
            VALUES ($1, $2, 50.00) 
            RETURNING id, phone_number, name, wallet_balance::FLOAT8, created_at::TEXT
        "#;

        final_user = sqlx::query_as::<sqlx::Postgres, UserRow>(insert_str)
            .bind(&auth_user.uid)
            .bind(&auth_user.phone_number)
            .fetch_one(&state.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Failed to provision new user: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user account".to_string())
            })?;
    }

    // ========================================================================
    // SECTION 4: Session Telemetry & Metadata Tracking
    // ========================================================================
    
    // Fire-and-forget update to keep the user's last login and timezone accurate
    // for exact delivery ETA calculations and push notifications later.
    let update_str = r#"
        UPDATE users 
        SET last_login = NOW(), 
            last_known_timezone = $1, 
            last_known_platform = $2 
        WHERE id = $3
    "#;

    let _ = sqlx::query(update_str)
        .bind(timezone)
        .bind(platform)
        .bind(&final_user.id)
        .execute(&state.db_pool)
        .await
        .map_err(|e| tracing::warn!("Failed to update telemetry for {}: {:?}", final_user.id, e));

    // ========================================================================
    // SECTION 5: Secure Response Formatting
    // ========================================================================
    
    let response = UserSyncResponse {
        id: final_user.id,
        phone_number: final_user.phone_number,
        name: final_user.name,
        wallet_balance: final_user.wallet_balance,
        is_new_user,
        timezone: Some(timezone.to_string()),
    };

    Ok((StatusCode::OK, Json(response)))
}