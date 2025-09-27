import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, boolean } from "drizzle-orm/pg-core";
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

// Audit log table for healthcare compliance
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ip: varchar("ip"),
  userAgent: text("user_agent"),
  method: varchar("method").notNull(),
  path: varchar("path").notNull(),
  userId: varchar("user_id"),
  userEmail: varchar("user_email"),
  statusCode: integer("status_code").notNull(),
  success: boolean("success").notNull(),
  sessionId: varchar("session_id"),
  metadata: text("metadata") // JSON string for additional context
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

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  ip: true,
  userAgent: true,
  method: true,
  path: true,
  userId: true,
  userEmail: true,
  statusCode: true,
  success: true,
  sessionId: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSteps = z.infer<typeof insertStepsSchema>;
export type Steps = typeof steps.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
