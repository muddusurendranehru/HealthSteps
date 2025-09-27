import { pgTable, varchar, integer, date, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

// Users table for healthcare center
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Steps tracking table
export const steps = pgTable("steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userEmail: varchar("user_email").notNull(), // Add required user_email field
  stepCount: integer("steps").notNull(), // Match actual database column name
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation with proper validation rules
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
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