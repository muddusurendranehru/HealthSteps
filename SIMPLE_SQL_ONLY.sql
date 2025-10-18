-- COPY THIS ENTIRE FILE AND PASTE IN NEON SQL EDITOR
-- For NEW database only!

-- Table 1: Users
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
CREATE INDEX users_created_at_idx ON users(created_at);

-- Table 2: Steps
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

CREATE INDEX steps_user_email_idx ON steps(user_email);
CREATE INDEX steps_date_idx ON steps(date);
CREATE INDEX steps_user_id_idx ON steps(user_id);
CREATE INDEX steps_user_date_idx ON steps(user_email, date);

-- DONE! Both tables created with INTEGER primary keys.

