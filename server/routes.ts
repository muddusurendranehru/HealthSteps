import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { IStorage } from './storage.js';
import { insertUserSchema, insertStepSchema } from '../shared/schema.js';

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export function createRoutes(storage: IStorage) {
  const router = Router();

  // User registration
  router.post('/api/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Store user session
      req.session.userId = user.id;
      
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Registration failed' });
    }
  });

  // User login
  router.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Store user session
      req.session.userId = user.id;
      
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get current user
  router.get('/api/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Logout
  router.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Add steps
  router.post('/api/steps', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const stepData = insertStepSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });

      // Check if steps already exist for this date
      const existing = await storage.getStepByUserAndDate(
        req.session.userId,
        stepData.date
      );

      let step;
      if (existing) {
        step = await storage.updateStep(existing.id, stepData.stepCount);
      } else {
        step = await storage.createStep(stepData);
      }

      res.json({ success: true, step });
    } catch (error) {
      console.error('Add steps error:', error);
      res.status(400).json({ error: 'Failed to add steps' });
    }
  });

  // Get steps for current user
  router.get('/api/steps', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const steps = await storage.getStepsByUserId(req.session.userId);
      res.json({ steps });
    } catch (error) {
      console.error('Get steps error:', error);
      res.status(500).json({ error: 'Failed to get steps' });
    }
  });

  return router;
}