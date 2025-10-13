import { pgTable, varchar, integer, date, timestamp, serial, numeric } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

// Users table for healthcare center - matches production database schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  age: integer("age"),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  heightCm: integer("height_cm"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Steps tracking table
export const steps = pgTable("steps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  userEmail: varchar("user_email").notNull(),
  stepCount: integer("steps").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation with proper validation rules
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true, // Accept 'password' from API, map to passwordHash in code
}).extend({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username: z.string().optional(),
  fullName: z.string().optional(),
  age: z.number().optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
});

export const insertStepSchema = createInsertSchema(steps).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Step = typeof steps.$inferSelect;
export type InsertStep = z.infer<typeof insertStepSchema>;