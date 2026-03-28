use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Extension, Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use crate::middleware::auth_guard::AuthenticatedUser;

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
    pub created_at: DateTime<Utc>,
}

// ============================================================================
// SECTION 2: The Core Synchronization Engine
// The primary Axum endpoint called by the mobile app upon successful OTP.
// ============================================================================

pub async fn sync_user(
    State(pool): State<PgPool>,
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
    // ========================================================================
    
    // 1. Check if the user already exists in PostgreSQL using their Firebase UID
    let existing_user = sqlx::query_as!(
        UserRow,
        r#"
        SELECT id, phone_number, name, wallet_balance::FLOAT8 as "wallet_balance!", created_at 
        FROM users 
        WHERE id = $1
        "#,
        auth_user.uid
    )
    .fetch_optional(&pool)
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
        final_user = sqlx::query_as!(
            UserRow,
            r#"
            INSERT INTO users (id, phone_number, wallet_balance) 
            VALUES ($1, $2, 50.00) 
            RETURNING id, phone_number, name, wallet_balance::FLOAT8 as "wallet_balance!", created_at
            "#,
            auth_user.uid,
            auth_user.phone_number
        )
        .fetch_one(&pool)
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
    let _ = sqlx::query!(
        r#"
        UPDATE users 
        SET last_login = NOW(), 
            last_known_timezone = $1, 
            last_known_platform = $2 
        WHERE id = $3
        "#,
        timezone,
        platform,
        final_user.id
    )
    .execute(&pool)
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