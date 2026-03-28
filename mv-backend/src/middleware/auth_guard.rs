use axum::{
    extract::Request,
    http::{header, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use tokio::sync::RwLock;

// ============================================================================
// SECTION 1: Firebase Claims & Context Engine
// Defines the exact structure of Google's Firebase JWT and our internal Axum Context.
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FirebaseClaims {
    pub exp: usize,
    pub iat: usize,
    pub aud: String,
    pub iss: String,
    pub sub: String,
    pub phone_number: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub uid: String,
    pub phone_number: String,
}

// ============================================================================
// SECTION 2: Google X.509 Certificate Caching Engine
// In-memory cache to store Google's public keys. Prevents network spam and latency.
// ============================================================================

static GOOGLE_CERTS_CACHE: RwLock<Option<HashMap<String, String>>> = RwLock::const_new(None);

async fn fetch_google_public_keys() -> Result<HashMap<String, String>, String> {
    // 1. Return from fast memory cache if available
    {
        let cache = GOOGLE_CERTS_CACHE.read().await;
        if let Some(certs) = &*cache {
            return Ok(certs.clone());
        }
    }

    // 2. Fetch fresh certificates from Google's official endpoint if cache is empty
    let certs_url = std::env::var("GOOGLE_CERTS_URL")
        .unwrap_or_else(|_| "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com".to_string());
    
    let response = reqwest::get(&certs_url)
        .await
        .map_err(|e| format!("Failed to fetch Google certs: {}", e))?;
        
    let certs: HashMap<String, String> = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Google certs: {}", e))?;

    // 3. Update the global cache
    let mut cache = GOOGLE_CERTS_CACHE.write().await;
    *cache = Some(certs.clone());
    
    Ok(certs)
}

// ============================================================================
// SECTION 5: Axum Middleware Engine (Main Interceptor)
// The core function wrapping all protected routes in the Axum Router.
// ============================================================================

pub async fn require_auth(mut req: Request, next: Next) -> Result<Response, Response> {
    
    // ========================================================================
    // SECTION 3: Strict Token Extraction & Validation
    // ========================================================================
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| {
            let body = Json(json!({"error": "Missing Authorization header"}));
            (StatusCode::UNAUTHORIZED, body).into_response()
        })?;

    if !auth_header.starts_with("Bearer ") {
        let body = Json(json!({"error": "Invalid Authorization header format. Expected 'Bearer <token>'"}));
        return Err((StatusCode::UNAUTHORIZED, body).into_response());
    }

    let token = &auth_header["Bearer ".len()..];

    // ========================================================================
    // SECTION 4: Cryptographic Signature & Project Verification
    // ========================================================================
    
    // A. Decode the JWT Header to extract the Key ID (kid)
    let header = decode_header(token).map_err(|_| {
        let body = Json(json!({"error": "Malformed JWT header"}));
        (StatusCode::UNAUTHORIZED, body).into_response()
    })?;

    let kid = header.kid.ok_or_else(|| {
        let body = Json(json!({"error": "JWT missing 'kid' claim"}));
        (StatusCode::UNAUTHORIZED, body).into_response()
    })?;

    // B. Fetch Google's Public Certificates (From Cache or Network)
    let certs = fetch_google_public_keys().await.map_err(|e| {
        let body = Json(json!({"error": "Internal Server Error", "details": e}));
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    })?;

    // C. Find the specific certificate used to sign this token
    let public_key_pem = certs.get(&kid).ok_or_else(|| {
        let body = Json(json!({"error": "Invalid Google signature key. Token may be forged or expired."}));
        (StatusCode::UNAUTHORIZED, body).into_response()
    })?;

    let decoding_key = DecodingKey::from_rsa_pem(public_key_pem.as_bytes()).map_err(|_| {
        let body = Json(json!({"error": "Failed to parse Google RSA public key"}));
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    })?;

    // D. Configure Strict Verification Parameters (Firebase Specs)
    let project_id = std::env::var("FIREBASE_PROJECT_ID")
        .unwrap_or_else(|_| "movyra-customer-prod".to_string());
        
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[&project_id]);
    validation.set_issuer(&[&format!("https://securetoken.google.com/{}", project_id)]);

    // E. Perform the Cryptographic Verification
    let token_data = decode::<FirebaseClaims>(token, &decoding_key, &validation).map_err(|e| {
        let body = Json(json!({"error": "Invalid or expired token", "details": e.to_string()}));
        (StatusCode::UNAUTHORIZED, body).into_response()
    })?;

    let claims = token_data.claims;

    // F. Extract strictly required data (Fail if user has no phone number attached)
    let phone_number = claims.phone_number.ok_or_else(|| {
        let body = Json(json!({"error": "Authentication requires a verified phone number."}));
        (StatusCode::FORBIDDEN, body).into_response()
    })?;

    // G. Context Injection (Attach secure data to Axum state pipeline)
    let authenticated_user = AuthenticatedUser {
        uid: claims.sub,
        phone_number,
    };

    req.extensions_mut().insert(authenticated_user);

    // Proceed to the next middleware or actual route handler
    Ok(next.run(req).await)
}