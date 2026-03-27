use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{encode, Header, EncodingKey};
use std::time::{SystemTime, UNIX_EPOCH};
use std::env;

#[derive(Deserialize)]
pub struct AuthRequest {
    pub firebase_token: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
}

#[derive(Debug, Serialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[derive(Deserialize)]
struct GoogleTokenInfo {
    sub: Option<String>,
    error: Option<String>,
}

/// Verifies a Firebase JWT using Google's public tokeninfo endpoint,
/// and issues an internal Movyra JWT for secure communication with the Axum backend.
pub async fn verify_token(Json(payload): Json<AuthRequest>) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    
    // Real logic: Verify the token against Google's OAuth2 endpoints to ensure it hasn't been forged.
    let google_url = format!("https://oauth2.googleapis.com/tokeninfo?id_token={}", payload.firebase_token);
    let res = client.get(&google_url)
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to contact Google API: {}", e)))?;

    if !res.status().is_success() {
        return Err((StatusCode::UNAUTHORIZED, "Invalid or expired Firebase Token".to_string()));
    }

    let google_data: GoogleTokenInfo = res.json().await
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Failed to parse token information".to_string()))?;

    if google_data.error.is_some() || google_data.sub.is_none() {
        return Err((StatusCode::UNAUTHORIZED, "Token verification rejected by identity provider".to_string()));
    }

    let firebase_uid = google_data.sub.unwrap();

    // Issue internal Movyra JWT
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "movyra_secure_secret_fallback_key_2026".to_string());
    
    // Token expires in 24 hours
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize + (24 * 3600);

    let claims = Claims {
        sub: firebase_uid,
        exp: expiration,
    };

    let token = encode(
        &Header::default(), 
        &claims, 
        &EncodingKey::from_secret(secret.as_ref())
    ).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to generate internal token: {}", e)))?;

    Ok(Json(AuthResponse { token }))
}