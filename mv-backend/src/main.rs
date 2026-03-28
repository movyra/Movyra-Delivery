use axum::{
    extract::State,
    http::{HeaderValue, Method},
    middleware as axum_middleware,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use dotenvy::dotenv;
use serde_json::json;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::net::SocketAddr;
use std::time::Duration;
use tower_http::{
    catch_panic::CatchPanicLayer,
    cors::{AllowOrigin, CorsLayer},
    limit::RequestBodyLimitLayer,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Declare modules based on the architecture blueprint
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod ws;

// ============================================================================
// NEW SECTION 1: Master Application State Engine
// Resolves E0432. Wraps the PostgreSQL pool and a globally reused HTTP client
// (for OSRM routing & APIs) to prevent socket exhaustion under high load.
// ============================================================================
#[derive(Clone)]
pub struct AppState {
    pub db_pool: sqlx::PgPool,
    pub http_client: reqwest::Client,
}

#[tokio::main]
async fn main() {
    // Load environment variables from the .env file
    dotenv().ok();

    // Initialize structured telemetry
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "info,mv_backend=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Initializing Movyra Backend Engine...");

    // Initialize connection to PostgreSQL (Supabase)
    let database_url = env::var("DATABASE_URL")
        .expect("CRITICAL: DATABASE_URL environment variable must be set in .env");
    
    let max_conns = env::var("DATABASE_MAX_CONNECTIONS").unwrap_or_else(|_| "20".into()).parse().unwrap_or(20);
    let acquire_timeout = env::var("DATABASE_ACQUIRE_TIMEOUT_SEC").unwrap_or_else(|_| "10".into()).parse().unwrap_or(10);

    let pool = PgPoolOptions::new()
        .max_connections(max_conns)
        .acquire_timeout(Duration::from_secs(acquire_timeout))
        .idle_timeout(Duration::from_secs(600))
        .max_lifetime(Duration::from_secs(1800))
        .connect(&database_url)
        .await
        .expect("CRITICAL: Failed to connect to the PostgreSQL database. Verify your DATABASE_URL.");

    tracing::info!("Database connection pool established successfully.");

    // ========================================================================
    // NEW SECTION 2: Automated Database Sanity Check
    // Proves the pooler is active before accepting web traffic.
    // ========================================================================
    tracing::info!("Performing database sanity check...");
    sqlx::query("SELECT 1")
        .execute(&pool)
        .await
        .expect("CRITICAL: Database sanity check failed. The pooler is unreachable.");
    tracing::info!("Database sanity check passed.");

    // Instantiate the global application state
    let app_state = AppState {
        db_pool: pool,
        http_client: reqwest::Client::builder()
            .timeout(Duration::from_secs(15))
            .build()
            .expect("Failed to build HTTP client"),
    };

    // Hardened CORS Engine
    let allowed_origins_str = env::var("ALLOWED_ORIGINS")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());
        
    let origins: Vec<HeaderValue> = allowed_origins_str
        .split(',')
        .map(|s| s.trim().parse::<HeaderValue>().expect("Invalid CORS origin in .env"))
        .collect();

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers(tower_http::cors::Any);

    // Protected API Pipeline
    let protected_routes = Router::new()
        .route("/auth/sync", post(handlers::user_handler::sync_user))
        // Placeholder for future logic
        // .route("/bookings", post(handlers::booking_handler::create_booking))
        // .route("/bookings/history", get(handlers::booking_handler::get_history))
        .route_layer(axum_middleware::from_fn(middleware::auth_guard::require_auth));

    // Public Routes (No auth required)
    let public_routes = Router::new()
        .route("/health", get(health_check));
        // .route("/pricing", post(handlers::booking_handler::calculate_pricing));

    // Merge API routes under the /api namespace
    let api_router = Router::new()
        .merge(public_routes)
        .merge(protected_routes);

    // Global Security & Reliability Guardrails
    let app = Router::new()
        .nest("/api", api_router)
        // Attach WebSockets
        // .route("/ws/tracking/:tracking_id", get(ws::tracking::ws_handler))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(CatchPanicLayer::new())
        .layer(RequestBodyLimitLayer::new(2 * 1024 * 1024))
        // Inject the AppState strictly into the router
        .with_state(app_state);

    // Bind TCP Listener and Serve
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("CRITICAL: Invalid HOST or PORT configuration in environment variables");

    tracing::info!("Movyra Backend Server running securely on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    
    // Bind with the Graceful Shutdown Engine
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

// ============================================================================
// NEW SECTION 3: Dynamic Health & Metrics Probe
// Interrogates the database live to confirm true health status.
// ============================================================================
async fn health_check(State(state): State<AppState>) -> impl IntoResponse {
    let db_status = match sqlx::query("SELECT 1").execute(&state.db_pool).await {
        Ok(_) => "healthy",
        Err(e) => {
            tracing::error!("Health Check DB Ping Failed: {:?}", e);
            "degraded"
        }
    };
    
    Json(json!({
        "status": "online",
        "database": db_status,
        "version": "1.0.0"
    }))
}

// ============================================================================
// NEW SECTION 4: Graceful Shutdown Engine
// Safely drains open connections to PostgreSQL upon SIGTERM (Render Deployment).
// ============================================================================
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("Shutdown signal received. Draining connections and terminating gracefully...");
}