use axum::{
    extract::Request,
    http::{header, HeaderValue, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::env;

// ============================================================================
// SECTION 1: Core Middleware Exports
// Resolves E0583 by explicitly exposing the cryptographic auth guard to main.rs.
// ============================================================================
pub mod auth_guard;

// ============================================================================
// SECTION 2: Strict Security Headers Engine
// Automatically injects enterprise-grade HTTP security headers into every response
// to prevent clickjacking, MIME-sniffing, and enforce strict transport security.
// ============================================================================
pub async fn security_headers(req: Request, next: Next) -> Response {
    let mut response = next.run(req).await;
    let headers = response.headers_mut();
    
    headers.insert(header::STRICT_TRANSPORT_SECURITY, HeaderValue::from_static("max-age=31536000; includeSubDomains"));
    headers.insert(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
    headers.insert(header::X_CONTENT_TYPE_OPTIONS, HeaderValue::from_static("nosniff"));
    headers.insert("Content-Security-Policy", HeaderValue::from_static("default-src 'self'"));
    headers.insert("Referrer-Policy", HeaderValue::from_static("strict-origin-when-cross-origin"));
    
    response
}

// ============================================================================
// SECTION 3: Minimum App Version Gatekeeper
// Reads the X-App-Version header sent by the React frontend and rejects
// requests from outdated APKs to prevent legacy bugs from hitting the DB.
// ============================================================================
pub async fn require_app_version(req: Request, next: Next) -> Result<Response, Response> {
    // Real logic: Define the minimum required version for the API
    let min_version = "1.0.0";
    
    if let Some(app_version) = req.headers().get("X-App-Version") {
        if let Ok(version_str) = app_version.to_str() {
            // In a strict production app, this parses semver. For MVP, string comparison suffices.
            if version_str >= min_version {
                return Ok(next.run(req).await);
            }
        }
    }
    
    let body = Json(json!({
        "error": "Upgrade Required",
        "message": "Your Movyra app version is too old. Please update from the Play Store."
    }));
    
    Err((StatusCode::UPGRADE_REQUIRED, body).into_response())
}

// ============================================================================
// SECTION 4: Zero-Downtime Maintenance Engine
// Allows DevOps to instantly block API traffic during critical PostgreSQL migrations
// by flipping a single environment variable, preventing data corruption.
// ============================================================================
pub async fn maintenance_mode(req: Request, next: Next) -> Result<Response, Response> {
    if let Ok(maintenance) = env::var("MAINTENANCE_MODE") {
        if maintenance == "true" || maintenance == "1" {
            let body = Json(json!({
                "error": "Service Unavailable",
                "message": "Movyra Logistics Engine is currently undergoing scheduled maintenance. Please try again in a few minutes."
            }));
            return Err((StatusCode::SERVICE_UNAVAILABLE, body).into_response());
        }
    }
    
    Ok(next.run(req).await)
}

// ============================================================================
// SECTION 5: Client IP Telemetry Extractor
// Safely extracts the real client IP behind Render/Cloudflare load balancers
// for anti-DDoS rate limiting and fraud prevention.
// ============================================================================
pub fn extract_real_ip(headers: &axum::http::HeaderMap) -> String {
    // 1. Prioritize Cloudflare's direct IP header if deployed behind CF
    if let Some(cf_ip) = headers.get("CF-Connecting-IP") {
        if let Ok(ip_str) = cf_ip.to_str() {
            return ip_str.to_string();
        }
    }
    
    // 2. Fallback to standard proxy header (Render.com, AWS ELB)
    if let Some(x_forwarded) = headers.get("X-Forwarded-For") {
        if let Ok(ip_str) = x_forwarded.to_str() {
            // Take the first IP in the comma-separated list (the original client)
            return ip_str.split(',').next().unwrap_or("Unknown").trim().to_string();
        }
    }
    
    "Unknown IP".to_string()
}