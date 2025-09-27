import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { Pool } from "pg";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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
app.use(cookieParser()); // Required for CSRF double-submit cookie pattern

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
    tableName: 'user_sessions', // Dedicated table for session storage
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
  name: 'healthstep.sid', // Custom session name for security
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours for healthcare security
    sameSite: 'strict' // CSRF protection
  }
}));

// Healthcare audit logging middleware with persistent storage
app.use((req, res, next) => {
  // Capture original response for audit logging
  const originalSend = res.send;
  const originalJson = res.json;
  
  let responseBody: any;
  
  res.send = function(body) {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };
  
  res.on('finish', async () => {
    // Log healthcare-relevant activities to PostgreSQL for compliance
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/steps')) {
      // Use preserved user info if session was cleared (e.g., logout)
      const auditUser = res.locals.auditUser || req.session?.user;
      
      const auditData = {
        ip: req.ip || req.connection.remoteAddress || null,
        userAgent: req.get('User-Agent') || null,
        method: req.method,
        path: req.path,
        userId: auditUser?.id || null,
        userEmail: auditUser?.email || null,
        statusCode: res.statusCode,
        success: res.statusCode < 400,
        sessionId: req.sessionID || null,
        metadata: JSON.stringify({ 
          responseSize: responseBody ? JSON.stringify(responseBody).length : 0,
          userAgent: req.get('User-Agent') 
        })
      };
      
      try {
        // Import storage here to avoid circular dependencies
        const { storage } = await import('./storage');
        await storage.logAuditEvent(auditData);
      } catch (error) {
        // Fallback to console if database logging fails (ensure audit trail)
        console.error('[AUDIT_ERROR] Failed to log to database:', error);
        console.log('[AUDIT_FALLBACK]', JSON.stringify(auditData));
      }
    }
  });
  
  next();
});

// CSRF Protection - DISABLED for small health center
// app.use('/api', (req: Request, res: Response, next: NextFunction) => {
//   // Skip CSRF for GET requests and auth endpoints (login/signup)
//   const isGetRequest = req.method === 'GET';
//   const isAuthEndpoint = req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/signup';
//   const isCsrfTokenEndpoint = req.originalUrl === '/api/csrf-token';
//   
//   if (isGetRequest || isAuthEndpoint || isCsrfTokenEndpoint) {
//     return next();
//   }
//   
//   const csrfHeader = req.headers['x-csrf-token'] as string;
//   const csrfCookie = req.cookies['csrf-token'];
//   
//   if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
//     console.log('[SECURITY] CSRF token validation failed for', req.method, req.originalUrl);
//     console.log('[SECURITY] Header token:', csrfHeader ? `${csrfHeader.slice(0, 8)}...` : 'missing');
//     console.log('[SECURITY] Cookie token:', csrfCookie ? `${csrfCookie.slice(0, 8)}...` : 'missing');
//     console.log('[SECURITY] Tokens match:', csrfHeader === csrfCookie);
//     return res.status(403).json({ message: 'CSRF token validation failed' });
//   }
//   
//   next();
// });

// Generate CSRF token endpoint (true double-submit cookie)
app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set CSRF token as non-HttpOnly cookie so JavaScript can read it
  res.cookie('csrf-token', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    httpOnly: false // Must be readable by JavaScript for double-submit pattern
  });
  
  res.json({ csrfToken: token });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
