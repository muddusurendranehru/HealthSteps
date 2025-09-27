import { users, steps, type User, type InsertUser, type Steps, type InsertSteps } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addSteps(stepsData: InsertSteps): Promise<Steps>;
  getStepsByUser(userEmail: string): Promise<Steps[]>;
  getStepsByUserAndDate(userEmail: string, date: string): Promise<Steps | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async addSteps(stepsData: InsertSteps): Promise<Steps> {
    // Check if steps already exist for this user and date
    const existingSteps = await this.getStepsByUserAndDate(stepsData.userEmail, stepsData.date);
    
    if (existingSteps) {
      // Update existing entry
      const [updatedSteps] = await db
        .update(steps)
        .set({ steps: stepsData.steps })
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

  async getStepsByUser(userEmail: string): Promise<Steps[]> {
    return await db
      .select()
      .from(steps)
      .where(eq(steps.userEmail, userEmail))
      .orderBy(desc(steps.date));
  }

  async getStepsByUserAndDate(userEmail: string, date: string): Promise<Steps | undefined> {
    const [stepsRecord] = await db
      .select()
      .from(steps)
      .where(and(eq(steps.userEmail, userEmail), eq(steps.date, date)));
    return stepsRecord || undefined;
  }
}

export const storage = new DatabaseStorage();
