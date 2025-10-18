-- ========================================
-- DATABASE NAME: homa_steps
-- CREATE THIS AS A NEW DATABASE IN NEON
-- ========================================

-- STEP 1: CREATE USERS TABLE
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

CREATE UNIQUE INDEX users_email_idx ON users(email);

-- STEP 2: CREATE STEPS TABLE
CREATE TABLE steps (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email  VARCHAR(255) NOT NULL,
  steps       INTEGER NOT NULL CHECK (steps >= 0 AND steps <= 100000),
  date        DATE NOT NULL CHECK (date <= CURRENT_DATE),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX steps_user_email_idx ON steps(user_email);
CREATE INDEX steps_date_idx ON steps(date);
CREATE INDEX steps_user_date_idx ON steps(user_email, date);

-- DONE! 
-- ✅ Table: users (INTEGER primary key)
-- ✅ Table: steps (INTEGER primary key)

