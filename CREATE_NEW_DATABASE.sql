-- ========================================
-- HEALTHSTEPS - NEW DATABASE SETUP
-- Run this in your NEW Neon database
-- Do NOT run in existing databases!
-- ========================================

-- ========================================
-- STEP 1: CREATE USERS TABLE
-- ========================================

CREATE TABLE users (
  id                SERIAL PRIMARY KEY,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  username          VARCHAR(100),
  full_name         VARCHAR(255),
  age               INTEGER,
  weight_kg         NUMERIC(5,2),
  height_cm         INTEGER,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE UNIQUE INDEX users_email_idx ON users(email);
CREATE INDEX users_created_at_idx ON users(created_at);

-- ========================================
-- STEP 2: CREATE STEPS TABLE
-- ========================================

CREATE TABLE steps (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email  VARCHAR(255) NOT NULL,
  steps       INTEGER NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  CONSTRAINT steps_positive CHECK (steps >= 0),
  CONSTRAINT steps_max CHECK (steps <= 100000),
  CONSTRAINT steps_date_not_future CHECK (date <= CURRENT_DATE)
);

-- Create indexes for steps table
CREATE INDEX steps_user_email_idx ON steps(user_email);
CREATE INDEX steps_date_idx ON steps(date);
CREATE INDEX steps_user_id_idx ON steps(user_id);
CREATE INDEX steps_user_date_idx ON steps(user_email, date);

-- ========================================
-- STEP 3: VERIFY TABLES
-- ========================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check steps table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'steps' 
ORDER BY ordinal_position;

-- ========================================
-- DONE!
-- ========================================
-- Both tables created with INTEGER primary keys
-- All indexes and constraints configured
-- Ready to use!
-- ========================================

