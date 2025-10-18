# 🚀 QUICK SETUP - CREATE DATABASE TABLES

## Option 1: Using Script (Recommended)

```bash
# Set your database URL (choose your OS)

# Windows PowerShell:
$env:DATABASE_URL="your-neon-connection-string"

# Windows CMD:
set DATABASE_URL=your-neon-connection-string

# Mac/Linux:
export DATABASE_URL="your-neon-connection-string"

# Then run:
npm run setup:db
```

## Option 2: Using .env File (Best for Development)

1. Create `.env` file:
```bash
DATABASE_URL=your-neon-connection-string
SESSION_SECRET=random-secret-key
PORT=5000
```

2. Run setup:
```bash
npm run setup:db
```

## What You'll Get:

✅ Users table (INTEGER primary key)
✅ Steps table (INTEGER primary key)
✅ All indexes and constraints
✅ Ready to use!

## Then Start Server:

```bash
npm start
```

Visit: http://localhost:5000

