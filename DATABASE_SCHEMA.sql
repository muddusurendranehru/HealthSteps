-- ========================================
-- HEALTHSTEPS DATABASE SCHEMA
-- Database: neondb (Neon PostgreSQL)
-- Region: Singapore (ap-southeast-1)
-- ========================================

-- ========================================
-- TABLE 1: USERS
-- Purpose: User authentication and profiles
-- Primary Key: INTEGER (SERIAL)
-- ========================================

CREATE TABLE users (
  id                INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
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

-- Create sequence for users table
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Indexes for users table
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);

-- ========================================
-- TABLE 2: STEPS
-- Purpose: Daily step tracking
-- Primary Key: INTEGER (SERIAL)
-- Foreign Key: user_id references users(id)
-- ========================================

CREATE TABLE steps (
  id          INTEGER PRIMARY KEY DEFAULT nextval('steps_id_seq'),
  user_id     INTEGER NOT NULL REFERENCES users(id),
  user_email  VARCHAR(255) NOT NULL,
  steps       INTEGER NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT now()
);

-- Create sequence for steps table
CREATE SEQUENCE IF NOT EXISTS steps_id_seq;

-- Indexes for steps table
CREATE INDEX IF NOT EXISTS steps_user_email_idx ON steps(user_email);
CREATE INDEX IF NOT EXISTS steps_date_idx ON steps(date);
CREATE INDEX IF NOT EXISTS steps_user_id_idx ON steps(user_id);

-- Composite index for efficient queries
CREATE INDEX IF NOT EXISTS steps_user_date_idx ON steps(user_email, date);

-- ========================================
-- TABLE 3: USER_SESSIONS (Auto-created)
-- Purpose: PostgreSQL-backed session storage
-- Created by: connect-pg-simple middleware
-- ========================================

-- This table is automatically created by connect-pg-simple
-- Structure (for reference):
-- CREATE TABLE "user_sessions" (
--   "sid" VARCHAR NOT NULL PRIMARY KEY,
--   "sess" JSON NOT NULL,
--   "expire" TIMESTAMP(6) NOT NULL
-- );

-- ========================================
-- SAMPLE QUERIES
-- ========================================

-- Get all users
SELECT id, email, username, created_at 
FROM users 
ORDER BY id DESC;

-- Get user steps for a specific user
SELECT s.id, s.steps, s.date, s.created_at
FROM steps s
WHERE s.user_email = 'user@example.com'
ORDER BY s.date DESC;

-- Get total steps for a user
SELECT 
  user_email,
  SUM(steps) as total_steps,
  COUNT(*) as days_tracked,
  AVG(steps) as avg_steps_per_day
FROM steps
WHERE user_email = 'user@example.com'
GROUP BY user_email;

-- Get steps by date range
SELECT date, steps
FROM steps
WHERE user_email = 'user@example.com'
  AND date BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY date DESC;

-- Get users with their step counts
SELECT 
  u.id,
  u.email,
  COUNT(s.id) as days_tracked,
  COALESCE(SUM(s.steps), 0) as total_steps
FROM users u
LEFT JOIN steps s ON u.id = s.user_id
GROUP BY u.id, u.email
ORDER BY total_steps DESC;

-- ========================================
-- DATA VALIDATION CONSTRAINTS
-- ========================================

-- Ensure steps are positive
ALTER TABLE steps 
ADD CONSTRAINT steps_positive 
CHECK (steps >= 0);

-- Ensure steps are reasonable (max 100,000 per day)
ALTER TABLE steps 
ADD CONSTRAINT steps_max 
CHECK (steps <= 100000);

-- Ensure date is not in the future
ALTER TABLE steps 
ADD CONSTRAINT steps_date_not_future 
CHECK (date <= CURRENT_DATE);

-- ========================================
-- USEFUL MAINTENANCE QUERIES
-- ========================================

-- Check table row counts
SELECT 
  'users' as table_name, 
  COUNT(*) as row_count 
FROM users
UNION ALL
SELECT 
  'steps' as table_name, 
  COUNT(*) as row_count 
FROM steps;

-- Check database size
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- BACKUP QUERIES
-- ========================================

-- Export users (without passwords)
COPY (
  SELECT id, email, username, full_name, age, weight_kg, height_cm, created_at
  FROM users
) TO '/tmp/users_backup.csv' WITH CSV HEADER;

-- Export steps
COPY steps TO '/tmp/steps_backup.csv' WITH CSV HEADER;

-- ========================================
-- CLEANUP QUERIES
-- ========================================

-- Delete old sessions (older than 30 days)
DELETE FROM user_sessions 
WHERE expire < NOW() - INTERVAL '30 days';

-- Delete test users
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%';

-- ========================================
-- SECURITY NOTES
-- ========================================

/*
✅ PRIMARY KEY TYPE: INTEGER (SERIAL with auto-increment)
✅ PASSWORD STORAGE: bcrypt hashed (never plain text)
✅ SESSIONS: PostgreSQL-backed for security
✅ FOREIGN KEYS: Enforced referential integrity
✅ INDEXES: Optimized for common queries
✅ CONSTRAINTS: Data validation at database level

❌ DO NOT:
- Store plain text passwords
- Use UUID (this project uses INTEGER)
- Hardcode database credentials
- Share .env files in Git
*/

-- ========================================
-- END OF SCHEMA
-- ========================================

