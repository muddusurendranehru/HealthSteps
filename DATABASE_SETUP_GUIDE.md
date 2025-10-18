# 🗄️ DATABASE SETUP GUIDE

This guide will help you create the HealthSteps database tables.

## 📋 Prerequisites

1. ✅ Node.js installed (v18+)
2. ✅ Neon PostgreSQL account
3. ✅ Database URL from Neon

---

## 🚀 QUICK START (3 Steps)

### Step 1: Get Your Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (looks like):
   ```
   postgresql://username:password@host.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Set Environment Variable

Create a `.env` file in the root directory:

```bash
DATABASE_URL=your-connection-string-here
SESSION_SECRET=your-random-secret-here
PORT=5000
NODE_ENV=development
```

Or set it temporarily in your terminal:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="your-connection-string-here"
```

**Windows (CMD):**
```cmd
set DATABASE_URL=your-connection-string-here
```

**Mac/Linux:**
```bash
export DATABASE_URL="your-connection-string-here"
```

### Step 3: Run Setup Script

```bash
npm run setup:db
```

That's it! 🎉

---

## 📊 WHAT GETS CREATED

### Table 1: USERS
```sql
CREATE TABLE users (
  id                SERIAL PRIMARY KEY,           -- INTEGER auto-increment
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
```

### Table 2: STEPS
```sql
CREATE TABLE steps (
  id          SERIAL PRIMARY KEY,                  -- INTEGER auto-increment
  user_id     INTEGER NOT NULL REFERENCES users(id),
  user_email  VARCHAR(255) NOT NULL,
  steps       INTEGER NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Plus:
- ✅ Indexes for performance
- ✅ Foreign key constraints
- ✅ Data validation (steps 0-100,000)
- ✅ Date validation (not future dates)

---

## 🛠️ AVAILABLE COMMANDS

### Create Tables
```bash
npm run setup:db
```

### Drop All Tables (⚠️ DELETES ALL DATA)
```bash
npm run drop:db
```

### Start Server
```bash
npm start
```

---

## 🔍 VERIFY SETUP

After running the setup, you should see:

```
🏥 HealthSteps Database Setup

========================================

1️⃣ Testing database connection...
✅ Database connection successful!

2️⃣ Creating USERS table...
✅ Users table created!

3️⃣ Creating indexes for USERS table...
✅ Users indexes created!

4️⃣ Creating STEPS table...
✅ Steps table created!

5️⃣ Creating indexes for STEPS table...
✅ Steps indexes created!

6️⃣ Verifying tables...
✅ Tables found: steps, users

7️⃣ Checking table structures...

📋 USERS table columns:
   - id (integer)
   - email (character varying)
   - password_hash (character varying)
   - username (character varying)
   - full_name (character varying)
   - age (integer)
   - weight_kg (numeric)
   - height_cm (integer)
   - created_at (timestamp without time zone)
   - updated_at (timestamp without time zone)

📋 STEPS table columns:
   - id (integer)
   - user_id (integer)
   - user_email (character varying)
   - steps (integer)
   - date (date)
   - created_at (timestamp without time zone)

8️⃣ Checking data...
✅ Users: 0 records
✅ Steps: 0 records

========================================
🎉 DATABASE SETUP COMPLETE!
========================================

✅ Tables created:
   1. users (with INTEGER primary key)
   2. steps (with INTEGER primary key)

✅ Indexes created for performance
✅ Constraints added for data validation
✅ Foreign keys configured

🚀 Ready to start the server!
   Run: npm start
```

---

## 🐛 TROUBLESHOOTING

### Error: "DATABASE_URL must be set"

**Solution:** Create a `.env` file or set the environment variable:
```bash
DATABASE_URL=your-neon-connection-string
```

### Error: "Cannot find package 'pg'"

**Solution:** Install dependencies:
```bash
npm install
```

### Error: "connection refused"

**Solution:** Check your Neon database:
1. Is it active? (Neon databases auto-sleep)
2. Is the connection string correct?
3. Is SSL mode set to `require`?

### Error: "role does not exist"

**Solution:** Your database URL might be incorrect. Get a fresh connection string from Neon Console.

### Error: "table already exists"

**Solution:** Tables are already created! You're good to go. Run:
```bash
npm start
```

If you want to recreate them:
```bash
npm run drop:db
npm run setup:db
```

---

## 📝 MANUAL SETUP (Alternative)

If you prefer to create tables manually:

1. Go to [Neon Console](https://console.neon.tech)
2. Open SQL Editor
3. Copy and paste from `DATABASE_SCHEMA.sql`
4. Run the queries

---

## 🔒 SECURITY CHECKLIST

- ✅ Never commit `.env` file to Git
- ✅ Never share your DATABASE_URL publicly
- ✅ Use different credentials for dev/prod
- ✅ Passwords are hashed with bcrypt
- ✅ Sessions are stored in PostgreSQL

---

## ✅ NEXT STEPS

After successful setup:

1. **Test the server:**
   ```bash
   npm start
   ```

2. **Open browser:**
   ```
   http://localhost:5000
   ```

3. **Create an account:**
   ```
   http://localhost:5000/signup.html
   ```

4. **Login and track steps:**
   ```
   http://localhost:5000/login.html
   ```

---

## 📞 NEED HELP?

- Check `DATABASE_SCHEMA.sql` for full schema
- Check `server.js` for table definitions
- Check `.cursorrules` for project rules

---

**Happy tracking! 🏃‍♂️💪**

