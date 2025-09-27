import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const steps = pgTable("steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userEmail: varchar("user_email").notNull(),
  steps: integer("steps").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertStepsSchema = createInsertSchema(steps).pick({
  userEmail: true,
  steps: true,
  date: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSteps = z.infer<typeof insertStepsSchema>;
export type Steps = typeof steps.$inferSelect;
