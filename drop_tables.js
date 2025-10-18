// ========================================
// HEALTHSTEPS - DROP TABLES SCRIPT
// ⚠️ WARNING: This will DELETE all data!
// Use this only if you want to start fresh
// ========================================

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function dropTables() {
  console.log('⚠️  WARNING: This will DELETE all tables and data!\n');
  
  try {
    console.log('🗑️  Dropping tables...\n');

    // Drop steps table first (has foreign key)
    console.log('1️⃣ Dropping STEPS table...');
    await pool.query('DROP TABLE IF EXISTS steps CASCADE;');
    console.log('✅ Steps table dropped\n');

    // Drop users table
    console.log('2️⃣ Dropping USERS table...');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('✅ Users table dropped\n');

    // Drop user_sessions if exists
    console.log('3️⃣ Dropping USER_SESSIONS table (if exists)...');
    await pool.query('DROP TABLE IF EXISTS user_sessions CASCADE;');
    console.log('✅ User_sessions table dropped\n');

    console.log('========================================');
    console.log('✅ ALL TABLES DROPPED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: node setup_database.js');
    console.log('   2. Run: npm start\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

dropTables();

