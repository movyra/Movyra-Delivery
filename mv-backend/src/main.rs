use axum::{
    routing::{get, post},
    Router,
    middleware as axum_middleware,
};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::net::SocketAddr;
use std::time::Duration;
use tower_http::{
    cors::{AllowHeaders, AllowMethods, AllowOrigin, CorsLayer},
    trace::TraceLayer,
    catch_panic::CatchPanicLayer,
    limit::RequestBodyLimitLayer,
};
use axum::http::{HeaderValue, Method};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Declare modules based on the architecture blueprint
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod ws;

#[tokio::main]
async fn main() {
    // 1. Load environment variables from the .env file
    dotenv().ok();

    // ========================================================================
    // NEW SECTION 1: Structured Telemetry & Logging Engine
    // Initializes formatting and log levels defined in the RUST_LOG env var.
    // ========================================================================
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "info,mv_backend=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Initializing Movyra Backend Engine...");

    // 2. Initialize connection to PostgreSQL (Supabase)
    let database_url = env::var("DATABASE_URL")
        .expect("CRITICAL: DATABASE_URL environment variable must be set in .env");
    
    // Parse connection limits dynamically from .env for easy scaling
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
    // NEW SECTION 2: Hardened CORS Engine
    // Strictly blocks unauthorized domains from accessing the Axum API.
    // ========================================================================
    let allowed_origins_str = env::var("ALLOWED_ORIGINS")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());
        
    let origins: Vec<HeaderValue> = allowed_origins_str
        .split(',')
        .map(|s| s.trim().parse::<HeaderValue>().expect("Invalid CORS origin in .env"))
        .collect();

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers(tower_http::cors::Any); // Allows Firebase Authorization headers

    // ========================================================================
    // NEW SECTION 3: Protected API Pipeline
    // Groups routes that strictly require a mathematically verified Firebase JWT.
    // ========================================================================
    let protected_routes = Router::new()
        // The real PostgreSQL Sync Endpoint
        .route("/auth/sync", post(handlers::user_handler::sync_user))
        // Placeholder for future logic
        // .route("/bookings", post(handlers::booking_handler::create_booking))
        // .route("/bookings/history", get(handlers::booking_handler::get_history))
        
        // This line strictly enforces the JWT cryptographic check on all routes above
        .route_layer(axum_middleware::from_fn(middleware::auth_guard::require_auth));

    // Public Routes (No auth required)
    let public_routes = Router::new()
        .route("/health", get(|| async { "Movyra API System: ONLINE and operating optimally." }));
        // .route("/pricing", post(handlers::booking_handler::calculate_pricing));

    // Merge API routes under the /api namespace
    let api_router = Router::new()
        .merge(public_routes)
        .merge(protected_routes);

    // ========================================================================
    // NEW SECTION 4: Global Security & Reliability Guardrails
    // ========================================================================
    let app = Router::new()
        .nest("/api", api_router)
        // Attach WebSockets
        // .route("/ws/tracking/:tracking_id", get(ws::tracking::ws_handler))
        
        // Attach Global Layers
        .layer(cors)
        .layer(TraceLayer::new_for_http())                 // Automatic HTTP request telemetry
        .layer(CatchPanicLayer::new())                     // Prevent thread panics from crashing the server
        .layer(RequestBodyLimitLayer::new(2 * 1024 * 1024))// 2MB payload cap against memory-exhaustion DDoS
        
        // Inject the PostgreSQL pool cleanly into the Axum state
        .with_state(pool);

    // 5. Bind TCP Listener and Serve
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("CRITICAL: Invalid HOST or PORT configuration in environment variables");

    tracing::info!("Movyra Backend Server running securely on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}