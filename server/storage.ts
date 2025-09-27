import { User, Step, InsertUser, InsertStep } from '../shared/schema.js';

export interface IStorage {
  // User operations
  createUser(userData: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;

  // Step operations
  createStep(stepData: InsertStep): Promise<Step>;
  getStepsByUserId(userId: string): Promise<Step[]>;
  getStepByUserAndDate(userId: string, date: string): Promise<Step | null>;
  updateStep(id: string, stepCount: number): Promise<Step>;
}

// Database storage implementation
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, steps } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(pool);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(userData).returning();
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async createStep(stepData: InsertStep): Promise<Step> {
    const result = await this.db.insert(steps).values(stepData).returning();
    return result[0];
  }

  async getStepsByUserId(userId: string): Promise<Step[]> {
    return this.db.select().from(steps).where(eq(steps.userId, userId));
  }

  async getStepByUserAndDate(userId: string, date: string): Promise<Step | null> {
    const result = await this.db.select().from(steps)
      .where(and(eq(steps.userId, userId), eq(steps.date, date)));
    return result[0] || null;
  }

  async updateStep(id: string, stepCount: number): Promise<Step> {
    const result = await this.db.update(steps)
      .set({ stepCount })
      .where(eq(steps.id, id))
      .returning();
    return result[0];
  }
}