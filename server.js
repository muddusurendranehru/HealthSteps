// HealthStep - Healthcare Center Backend Server
import 'dotenv/config';  // Load environment variables from .env file
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import path from 'path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { pgTable, text, varchar, integer, date, timestamp, boolean, serial } from 'drizzle-orm/pg-core';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database schema - FIXED to match actual Neon database
const users = pgTable("users", {
  id: integer("id").primaryKey().notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }),
  fullName: varchar("full_name", { length: 255 }),
  age: integer("age"),
  weightKg: varchar("weight_kg"),
  heightCm: integer("height_cm"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const steps = pgTable("steps", {
  id: integer("id").primaryKey().notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  steps: integer("steps").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(),
});

// Audit logs table - COMMENTED OUT (doesn't exist in database)
// If you want audit logging, create this table in Neon first:
// CREATE TABLE audit_logs (
//   id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
//   timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
//   ip VARCHAR,
//   user_agent TEXT,
//   method VARCHAR NOT NULL,
//   path VARCHAR NOT NULL,
//   user_id VARCHAR,
//   user_email VARCHAR,
//   status_code INTEGER NOT NULL,
//   success BOOLEAN NOT NULL,
//   session_id VARCHAR,
//   metadata TEXT
// );

const auditLogs = null; // Disabled until table is created

// Validation schemas
const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const insertStepsSchema = z.object({
  userEmail: z.string().email(),
  steps: z.number().min(0).max(100000),
  date: z.string(),
});

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool, { schema: { users, steps } });

// Database storage layer
class DatabaseStorage {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser) {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPassword(userId, hashedPassword) {
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, userId));
  }

  async addSteps(stepsData) {
    // Check if steps already exist for this user and date
    const existingSteps = await this.getStepsByUserAndDate(stepsData.userEmail, stepsData.date);
    
    if (existingSteps) {
      // ADD to existing steps (cumulative total for the day)
      const newTotal = existingSteps.steps + stepsData.steps;
      const [updatedSteps] = await db
        .update(steps)
        .set({ steps: newTotal })
        .where(eq(steps.id, existingSteps.id))
        .returning();
      return updatedSteps;
    } else {
      // Create new entry
      const [newSteps] = await db
        .insert(steps)
        .values(stepsData)
        .returning();
      return newSteps;
    }
  }

  async getStepsByUser(userEmail) {
    return await db
      .select()
      .from(steps)
      .where(eq(steps.userEmail, userEmail))
      .orderBy(desc(steps.date));
  }

  async getStepsByUserAndDate(userEmail, date) {
    const [stepsRecord] = await db
      .select()
      .from(steps)
      .where(and(eq(steps.userEmail, userEmail), eq(steps.date, date)));
    return stepsRecord || undefined;
  }

  async logAuditEvent(auditData) {
    // Audit logging disabled - table doesn't exist in database
    // To enable: Create audit_logs table in Neon first
    console.log('[AUDIT] Logging disabled - audit_logs table not found');
    return null;
  }
}

const storage = new DatabaseStorage();

// Express app setup
const app = express();

// Trust proxy for secure cookies behind load balancer/TLS terminator
app.set('trust proxy', 1);

// BYPASS ALL CORS RESTRICTIONS for small healthcare center
app.use(cors({ 
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// PostgreSQL session store for healthcare-grade security
const PgSession = connectPgSimple(session);
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Session middleware for server-side authentication with PostgreSQL backing
app.use(session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable is required in production');
    }
    console.warn('Warning: Using default session secret. Set SESSION_SECRET environment variable in production.');
    return 'healthstep-dev-secret-key-' + Math.random().toString(36);
  })(),
  resave: false,
  saveUninitialized: false,
  name: 'healthstep.sid',
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours for healthcare security
    sameSite: 'strict'
  }
}));

// Healthcare audit logging middleware - DISABLED (audit_logs table doesn't exist)
// To enable: Create audit_logs table in Neon first, then uncomment this
/*
app.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const statusCode = res.statusCode;
    const success = statusCode >= 200 && statusCode < 400;
    
    // Skip audit logging for static files and some routes
    if (!req.path.startsWith('/api/')) {
      return originalSend.call(this, data);
    }
    
    const auditData = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      userId: req.session?.user?.id || null,
      userEmail: req.session?.user?.email || null,
      statusCode: statusCode,
      success: success,
      sessionId: req.sessionID || null,
      metadata: JSON.stringify({
        query: req.query,
        body: req.method === 'POST' ? '***REDACTED***' : undefined,
        timestamp: new Date().toISOString()
      })
    };
    
    // Log audit event asynchronously (don't block response)
    storage.logAuditEvent(auditData).catch(err => {
      console.error('Audit logging failed:', err);
    });
    
    return originalSend.call(this, data);
  };
  
  next();
});
*/

// Serve static files from root directory
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '.')));

// API Routes

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = await storage.createUser({ email, passwordHash: hashedPassword });
    res.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ message: "Invalid signup data" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = insertUserSchema.parse(req.body);
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check if password is correct - handle both hashed and plain text passwords
    let isPasswordValid = false;
    
    // Check if the stored password looks like a bcrypt hash
    if (user.passwordHash && (user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2y$'))) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    } else if (user.passwordHash) {
      // Fallback for plain text passwords (development/migration)
      isPasswordValid = password === user.passwordHash;
      
      // If plain text password matches, hash it for future use
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await storage.updateUserPassword(user.id, hashedPassword);
        console.log('Upgraded plain text password to hashed for user:', user.email);
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Store user in session
    req.session.user = { id: user.id, email: user.email };
    
    res.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: "Invalid login data" });
  }
});

// Get current user status
app.get('/api/auth/status', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  console.log('Logout request - destroying session for user:', req.session.user?.email);
  const sessionId = req.sessionID;
  
  // Preserve user info for audit logging before destroying session
  res.locals.auditUser = req.session.user;
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ message: "Logout failed" });
    }
    // Clear session cookie with proper options
    res.clearCookie('healthstep.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    console.log('Session destroyed successfully for ID:', sessionId);
    res.json({ message: "Logged out successfully" });
  });
});

// Steps routes - SECURITY BYPASSED for small healthcare center
app.post('/api/steps', async (req, res) => {
  try {
    console.log('POST /api/steps - Security bypassed for small healthcare center');
    
    // NO AUTHENTICATION REQUIRED - Direct database insertion
    const { steps, date, userEmail } = req.body;
    
    // Use provided email or session email as fallback
    const email = userEmail || req.session?.user?.email;
    
    if (!email) {
      return res.status(400).json({ message: "User email required" });
    }
    
    // LOOKUP USER ID by email for foreign key constraint
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    // Validate request data (without userId - server provides this)
    const validatedSteps = insertStepsSchema.parse({
      userEmail: email,
      steps,
      date
    });
    
    // ADD user_id for database constraint (server-provided)
    const stepsWithUserId = {
      ...validatedSteps,
      userId: user.id  // This satisfies the foreign key constraint
    };
    
    console.log('POST /api/steps - Adding steps for user:', email, 'with ID:', user.id);
    const stepEntry = await storage.addSteps(stepsWithUserId);
    res.json(stepEntry);
  } catch (error) {
    console.error("Add steps error:", error);
    res.status(400).json({ message: "Invalid steps data" });
  }
});

app.get('/api/steps', async (req, res) => {
  try {
    console.log('GET /api/steps - Security bypassed for small healthcare center');
    
    // NO AUTHENTICATION REQUIRED - Allow access to step data
    const userEmail = req.query.userEmail || req.session?.user?.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: "User email required" });
    }
    
    console.log('GET /api/steps - Fetching steps for:', userEmail);
    const userSteps = await storage.getStepsByUser(userEmail);
    res.json(userSteps);
  } catch (error) {
    console.error("Get steps error:", error);
    res.status(500).json({ message: "Failed to fetch steps" });
  }
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  // Only serve index.html if it's not an API route or static file
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`HealthStep server running on port ${PORT}`);
  console.log('Healthcare center step tracking system ready!');
});

export default app;