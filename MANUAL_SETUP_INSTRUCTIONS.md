# 🗄️ MANUAL DATABASE SETUP - DO IT YOURSELF

## ⚠️ IMPORTANT: Create a NEW Database

**DO NOT run this in your existing databases!**

You have 3 databases already. Create a **NEW** one for HealthSteps.

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### Step 1: Create New Database in Neon

1. Go to your [Neon Console](https://console.neon.tech/app/projects/autumn-darkness-64907462)
2. Click **"Create Database"** button
3. Name it: `healthsteps` (or any name you prefer)
4. Wait for creation to complete

### Step 2: Open SQL Editor

1. In Neon Console, select your **NEW** database (`healthsteps`)
2. Click on **"SQL Editor"** tab
3. You should see an empty query editor

### Step 3: Copy and Run the SQL

1. Open the file: `CREATE_NEW_DATABASE.sql`
2. Copy ALL the content
3. Paste into Neon SQL Editor
4. Click **"Run"** button

You should see:
```
✅ Table "users" created
✅ Table "steps" created
✅ Indexes created
```

### Step 4: Get Your NEW Database URL

1. In Neon Console, click **"Connection Details"**
2. Select your **NEW** database (`healthsteps`)
3. Copy the connection string (looks like):
   ```
   postgresql://username:password@host.region.aws.neon.tech/healthsteps?sslmode=require
   ```

### Step 5: Update Your .env File

Create `.env` file in your project:

```bash
# Use your NEW database URL here
DATABASE_URL=postgresql://username:password@host/healthsteps?sslmode=require
SESSION_SECRET=your-random-secret-here
PORT=5000
NODE_ENV=development
```

### Step 6: Start Your Server

```bash
npm start
```

---

## 📊 WHAT YOU'LL GET

### Table 1: USERS
- id (INTEGER PRIMARY KEY)
- email (UNIQUE)
- password_hash
- username
- full_name
- age
- weight_kg
- height_cm
- created_at
- updated_at

### Table 2: STEPS
- id (INTEGER PRIMARY KEY)
- user_id (REFERENCES users)
- user_email
- steps
- date
- created_at

---

## 🔒 YOUR EXISTING DATABASES ARE SAFE

This setup creates tables in a **NEW** database only.

Your existing 3 databases remain untouched:
- COD_HOMA_IQ_SCORE (the one you mentioned)
- Any other databases you have

---

## ✅ VERIFICATION

After running the SQL, verify in Neon Console:

1. Go to **"Tables"** tab
2. You should see:
   - ✅ users
   - ✅ steps

3. Click on each table to see the structure

---

## 🚀 READY TO USE

Once tables are created:

1. Start server: `npm start`
2. Visit: http://localhost:5000
3. Create account and track steps!

---

**No automatic scripts. You have full control.** 👍

