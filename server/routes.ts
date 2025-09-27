import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStepsSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import "./types"; // Session type declarations

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      const user = await storage.createUser({ email, password: hashedPassword });
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
      
      // Check if the stored password looks like a bcrypt hash (starts with $2b$ or similar)
      const isBcryptHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$');
      
      if (isBcryptHash) {
        // This is a bcrypt hash, use bcrypt.compare with error handling
        try {
          isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (error) {
          // If bcrypt.compare fails (malformed hash), treat as invalid credentials
          return res.status(401).json({ message: "Invalid credentials" });
        }
      } else {
        // This is likely a plain text password (legacy user)
        isPasswordValid = user.password === password;
        
        // If plain text password matches, hash it and update for security
        if (isPasswordValid) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          await storage.updateUserPassword(user.id, hashedPassword);
        }
      }
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Regenerate session ID for security, then store user data
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ message: "Login failed" });
        }
        req.session.user = { id: user.id, email: user.email };
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({ id: user.id, email: user.email });
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Auth status check
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
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      // Clear session cookie with proper options (must match session name)
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

  // Steps routes - secured with session validation
  app.post('/api/steps', async (req, res) => {
    try {
      // Debug session state
      console.log('POST /api/steps - Session state:', { 
        sessionId: req.sessionID, 
        hasUser: !!req.session.user,
        userEmail: req.session.user?.email 
      });
      
      // Require authentication
      if (!req.session.user) {
        console.log('POST /api/steps - Authentication failed: No session user');
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Validate and sanitize input data
      const { steps, date } = req.body;
      const validatedSteps = insertStepsSchema.parse({
        userEmail: req.session.user.email, // Use authenticated user's email
        steps,
        date
      });
      
      console.log('POST /api/steps - Adding steps for user:', req.session.user.email);
      const stepEntry = await storage.addSteps(validatedSteps);
      res.json(stepEntry);
    } catch (error) {
      console.error("Add steps error:", error);
      res.status(400).json({ message: "Invalid steps data" });
    }
  });

  app.get('/api/steps', async (req, res) => {
    try {
      // Debug session state
      console.log('GET /api/steps - Session state:', { 
        sessionId: req.sessionID, 
        hasUser: !!req.session.user,
        userEmail: req.session.user?.email 
      });
      
      // Require authentication
      if (!req.session.user) {
        console.log('GET /api/steps - Authentication failed: No session user');
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Return steps for authenticated user only
      console.log('GET /api/steps - Fetching steps for user:', req.session.user.email);
      const userSteps = await storage.getStepsByUser(req.session.user.email);
      res.json(userSteps);
    } catch (error) {
      console.error("Get steps error:", error);
      res.status(500).json({ message: "Failed to fetch steps" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
