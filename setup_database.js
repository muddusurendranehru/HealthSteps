// ========================================
// HEALTHSTEPS - DATABASE SETUP SCRIPT
// Creates the users and steps tables
// ========================================

import pg from 'pg';
const { Pool } = pg;

// Check for DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.log('\n📝 Please create a .env file with your Neon database URL:');
  console.log('   DATABASE_URL=postgresql://username:password@host/database?sslmode=require\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🏥 HealthSteps Database Setup\n');
  console.log('========================================\n');

  try {
    // Test connection
    console.log('1️⃣ Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Create users table
    console.log('2️⃣ Creating USERS table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
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
    `);
    console.log('✅ Users table created!\n');

    // Create indexes for users
    console.log('3️⃣ Creating indexes for USERS table...');
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);
    `);
    console.log('✅ Users indexes created!\n');

    // Create steps table
    console.log('4️⃣ Creating STEPS table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS steps (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_email  VARCHAR(255) NOT NULL,
        steps       INTEGER NOT NULL CHECK (steps >= 0 AND steps <= 100000),
        date        DATE NOT NULL CHECK (date <= CURRENT_DATE),
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Steps table created!\n');

    // Create indexes for steps
    console.log('5️⃣ Creating indexes for STEPS table...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS steps_user_email_idx ON steps(user_email);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS steps_date_idx ON steps(date);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS steps_user_id_idx ON steps(user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS steps_user_date_idx ON steps(user_email, date);
    `);
    console.log('✅ Steps indexes created!\n');

    // Verify tables
    console.log('6️⃣ Verifying tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'steps')
      ORDER BY table_name;
    `);
    
    console.log('✅ Tables found:', tablesResult.rows.map(r => r.table_name).join(', '));
    console.log('');

    // Check table structures
    console.log('7️⃣ Checking table structures...\n');
    
    // Users table
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 USERS table columns:');
    usersColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

    // Steps table
    const stepsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'steps' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 STEPS table columns:');
    stepsColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

    // Check row counts
    console.log('8️⃣ Checking data...');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const stepsCount = await pool.query('SELECT COUNT(*) FROM steps');
    
    console.log(`✅ Users: ${usersCount.rows[0].count} records`);
    console.log(`✅ Steps: ${stepsCount.rows[0].count} records\n`);

    console.log('========================================');
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('✅ Tables created:');
    console.log('   1. users (with INTEGER primary key)');
    console.log('   2. steps (with INTEGER primary key)');
    console.log('\n✅ Indexes created for performance');
    console.log('✅ Constraints added for data validation');
    console.log('✅ Foreign keys configured');
    console.log('\n🚀 Ready to start the server!');
    console.log('   Run: npm start\n');

  } catch (error) {
    console.error('\n❌ ERROR during setup:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase();

