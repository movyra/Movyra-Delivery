-- Movyra Delivery System - Initial Schema
-- Target: PostgreSQL (Supabase)

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table: Matches Firebase Auth UID
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table: Core Delivery Logic
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_lat DOUBLE PRECISION NOT NULL,
    dropoff_lng DOUBLE PRECISION NOT NULL,
    parcel_type_id VARCHAR(50) NOT NULL,
    parcel_type_name VARCHAR(100) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    tracking_id VARCHAR(100) UNIQUE NOT NULL,
    otp VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-performance Indices
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tracking_id ON bookings(tracking_id);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);