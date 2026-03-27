use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Represents a Movyra User in the PostgreSQL database.
/// Maps strictly to the `users` table.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    /// Internal unique identifier (UUID stored as String)
    pub id: String,
    
    /// The unique UID provided by Firebase Authentication
    pub firebase_uid: String,
    
    /// User's verified email address
    pub email: String,
    
    /// User's full name (optional, populated after profile setup)
    pub full_name: Option<String>,
    
    /// User's phone number for driver contact (optional)
    pub phone_number: Option<String>,
    
    /// ISO8601 Timestamp of account creation
    pub created_at: Option<String>,
}