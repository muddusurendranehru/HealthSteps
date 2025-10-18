# 📋 STEP-BY-STEP INSTRUCTIONS

## Your Current Neon Databases:
1. ✅ homa_iq (existing - don't touch)
2. ✅ homa_auth (existing - don't touch)  
3. ✅ (one more existing database - don't touch)
4. ⭐ **homa_steps** (NEW - create this now)

---

## STEP 1: Create New Database

1. Go to: https://console.neon.tech/app/projects/autumn-darkness-64907462
2. Click **"Create Database"** button (usually top right)
3. Database name: `homa_steps`
4. Click **"Create"**
5. Wait 10 seconds for creation

---

## STEP 2: Open SQL Editor

1. In Neon Console, select database: **homa_steps** (dropdown)
2. Click **"SQL Editor"** tab
3. You'll see empty query box

---

## STEP 3: Run the SQL

1. Open file: `HOMA_STEPS_DATABASE.sql`
2. Copy ALL lines (Ctrl+A, Ctrl+C)
3. Paste in Neon SQL Editor (Ctrl+V)
4. Click **"Run"** button
5. Wait for success message

You should see:
```
✅ CREATE TABLE (users)
✅ CREATE INDEX
✅ CREATE TABLE (steps)  
✅ CREATE INDEX (3 indexes)
```

---

## STEP 4: Verify Tables Created

In Neon Console:
1. Click **"Tables"** tab
2. You should see:
   - ✅ users
   - ✅ steps

---

## STEP 5: Get Connection String

1. Click **"Connection Details"** (in Neon)
2. Make sure **homa_steps** database is selected
3. Copy the connection string
4. It will look like:
   ```
   postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/homa_steps?sslmode=require
   ```

---

## STEP 6: Update Your Project

Create `.env` file in project folder:

```
DATABASE_URL=postgresql://neondb_owner:npg_Bl9kug4wxKzN@ep-weathered-paper-a1mbh5zv-pooler.ap-southeast-1.aws.neon.tech/homa_steps?sslmode=require
SESSION_SECRET=your-random-secret-123456
PORT=5000
NODE_ENV=development
```

(Replace with your actual connection string from Step 5)

---

## STEP 7: Start Server

```bash
npm start
```

Visit: http://localhost:5000

---

## ✅ DONE!

You now have:
- ✅ homa_iq (untouched)
- ✅ homa_auth (untouched)
- ✅ your 3rd database (untouched)
- ⭐ **homa_steps** (NEW with 2 tables)

---

## If You See Error:

Tell me the error message and which step you're on.

