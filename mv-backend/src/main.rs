use axum::{
    routing::{get, post},
    Router,
    Extension,
};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

// Declare modules based on the architecture blueprint
pub mod handlers;
pub mod models;
pub mod ws;

/// Shared Application State
/// This struct holds the PostgreSQL connection pool and is shared across all Axum handlers.
#[derive(Clone)]
pub struct AppState {
    pub db_pool: sqlx::PgPool,
}

#[tokio::main]
async fn main() {
    // 1. Load environment variables from the .env file
    dotenv().ok();

    // 2. Initialize connection to PostgreSQL (Supabase)
    let database_url = env::var("DATABASE_URL")
        .expect("CRITICAL: DATABASE_URL environment variable must be set in .env");

    println!("Establishing connection to the PostgreSQL database...");
    
    // Create a robust connection pool suitable for production workloads
    let pool = PgPoolOptions::new()
        .max_connections(50)
        .connect(&database_url)
        .await
        .expect("CRITICAL: Failed to connect to the PostgreSQL database. Verify your DATABASE_URL.");

    println!("Database connection pool established successfully.");

    // Wrap the state in an Arc to safely share it across asynchronous threads
    let shared_state = Arc::new(AppState { db_pool: pool });

    // 3. Configure Global CORS
    // Essential for allowing the Vite React frontend to communicate with this API
    let cors = CorsLayer::new()
        .allow_origin(Any) // In production, replace `Any` with your actual frontend domains
        .allow_methods(Any)
        .allow_headers(Any);

    // 4. Build the Axum Router
    let app = Router::new()
        // Core Health Check
        .route("/api/health", get(|| async { "Movyra API System: ONLINE and operating optimally." }))
        
        // ---- API Endpoints ----
        // Uncomment these as the handler logic files are populated in the next steps
        // .route("/api/auth/verify", post(handlers::auth_handler::verify_token))
        // .route("/api/bookings", post(handlers::booking_handler::create_booking))
        // .route("/api/bookings/history", get(handlers::booking_handler::get_history))
        // .route("/api/pricing", post(handlers::booking_handler::calculate_pricing))
        
        // ---- WebSockets ----
        // .route("/ws/tracking/:tracking_id", get(ws::tracking::ws_handler))
        
        // Attach middleware
        .layer(cors)
        .layer(Extension(shared_state));

    // 5. Bind TCP Listener and Serve
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("CRITICAL: Invalid HOST or PORT configuration in environment variables");

    println!("Movyra Backend Server running securely on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}