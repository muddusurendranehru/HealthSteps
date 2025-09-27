import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStepsSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

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
      
      try {
        // Try bcrypt compare first (for new hashed passwords)
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (error) {
        // If bcrypt compare fails, try plain text comparison (for legacy users)
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
      
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Steps routes
  app.post('/api/steps', async (req, res) => {
    try {
      const stepsData = insertStepsSchema.parse(req.body);
      const steps = await storage.addSteps(stepsData);
      res.json(steps);
    } catch (error) {
      console.error("Add steps error:", error);
      res.status(400).json({ message: "Invalid steps data" });
    }
  });

  app.get('/api/steps/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const userSteps = await storage.getStepsByUser(email);
      res.json(userSteps);
    } catch (error) {
      console.error("Get steps error:", error);
      res.status(500).json({ message: "Failed to fetch steps" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
