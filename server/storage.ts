import {
  users,
  userProfiles,
  questions,
  simulados,
  userAnswers,
  userStats,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Question,
  type InsertQuestion,
  type Simulado,
  type InsertSimulado,
  type UserAnswer,
  type InsertUserAnswer,
  type UserStats,
  type InsertUserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, count, avg, sum } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile & { userId: string }): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Questions operations
  getQuestions(filters?: {
    subject?: string;
    examBoard?: string;
    examYear?: number;
    examType?: string;
    difficulty?: "easy" | "medium" | "hard";
    limit?: number;
    offset?: number;
  }): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question>;
  
  // Simulados operations
  getSimulados(userId: string): Promise<Simulado[]>;
  getSimulado(id: string): Promise<Simulado | undefined>;
  createSimulado(simulado: InsertSimulado & { userId: string }): Promise<Simulado>;
  updateSimulado(id: string, simulado: Partial<InsertSimulado>): Promise<Simulado>;
  
  // User answers operations
  getUserAnswers(userId: string, questionId?: string, simuladoId?: string): Promise<UserAnswer[]>;
  createUserAnswer(answer: InsertUserAnswer & { userId: string }): Promise<UserAnswer>;
  
  // Statistics operations
  getUserStats(userId: string, subject?: string): Promise<UserStats[]>;
  updateUserStats(userId: string, subject: string): Promise<UserStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile & { userId: string }): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        ...profile,
        userId: profile.userId,
      })
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const updateData: any = { updatedAt: new Date() };
    
    if (profile.userType !== undefined) updateData.userType = profile.userType;
    if (profile.goals !== undefined) updateData.goals = profile.goals;
    if (profile.weeklyHours !== undefined) updateData.weeklyHours = profile.weeklyHours;
    if (profile.studyTimes !== undefined) updateData.studyTimes = profile.studyTimes;
    if (profile.subjects !== undefined) updateData.subjects = profile.subjects;
    if (profile.onboardingCompleted !== undefined) updateData.onboardingCompleted = profile.onboardingCompleted;
    
    const [updatedProfile] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }
  
  // Questions operations
  async getQuestions(filters?: {
    subject?: string;
    examBoard?: string;
    examYear?: number;
    examType?: string;
    difficulty?: "easy" | "medium" | "hard";
    limit?: number;
    offset?: number;
  }): Promise<Question[]> {
    const conditions = [eq(questions.isActive, true)];
    
    if (filters?.subject) {
      conditions.push(eq(questions.subject, filters.subject));
    }
    if (filters?.examBoard) {
      conditions.push(eq(questions.examBoard, filters.examBoard));
    }
    if (filters?.examYear) {
      conditions.push(eq(questions.examYear, filters.examYear));
    }
    if (filters?.examType) {
      conditions.push(eq(questions.examType, filters.examType));
    }
    if (filters?.difficulty) {
      conditions.push(eq(questions.difficulty, filters.difficulty));
    }
    
    let query = db
      .select()
      .from(questions)
      .where(and(...conditions))
      .orderBy(desc(questions.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }
  
  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }
  
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values(question)
      .returning();
    return newQuestion;
  }
  
  async updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question> {
    const [updatedQuestion] = await db
      .update(questions)
      .set({ ...question, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }
  
  // Simulados operations
  async getSimulados(userId: string): Promise<Simulado[]> {
    return await db
      .select()
      .from(simulados)
      .where(eq(simulados.userId, userId))
      .orderBy(desc(simulados.createdAt));
  }
  
  async getSimulado(id: string): Promise<Simulado | undefined> {
    const [simulado] = await db.select().from(simulados).where(eq(simulados.id, id));
    return simulado;
  }
  
  async createSimulado(simulado: InsertSimulado & { userId: string }): Promise<Simulado> {
    const [newSimulado] = await db
      .insert(simulados)
      .values(simulado)
      .returning();
    return newSimulado;
  }
  
  async updateSimulado(id: string, simulado: Partial<InsertSimulado>): Promise<Simulado> {
    const [updatedSimulado] = await db
      .update(simulados)
      .set(simulado)
      .where(eq(simulados.id, id))
      .returning();
    return updatedSimulado;
  }
  
  // User answers operations
  async getUserAnswers(userId: string, questionId?: string, simuladoId?: string): Promise<UserAnswer[]> {
    const conditions = [eq(userAnswers.userId, userId)];
    
    if (questionId) {
      conditions.push(eq(userAnswers.questionId, questionId));
    }
    if (simuladoId) {
      conditions.push(eq(userAnswers.simuladoId, simuladoId));
    }
    
    return await db
      .select()
      .from(userAnswers)
      .where(and(...conditions))
      .orderBy(desc(userAnswers.createdAt));
  }
  
  async createUserAnswer(answer: InsertUserAnswer & { userId: string }): Promise<UserAnswer> {
    const [newAnswer] = await db
      .insert(userAnswers)
      .values(answer)
      .returning();
    
    // Update question statistics
    await this.updateQuestionStats(answer.questionId);
    
    // Update user statistics
    const question = await this.getQuestion(answer.questionId);
    if (question) {
      await this.updateUserStats(answer.userId, question.subject);
    }
    
    return newAnswer;
  }
  
  // Statistics operations
  async getUserStats(userId: string, subject?: string): Promise<UserStats[]> {
    const conditions = [eq(userStats.userId, userId)];
    
    if (subject) {
      conditions.push(eq(userStats.subject, subject));
    }
    
    return await db
      .select()
      .from(userStats)
      .where(and(...conditions))
      .orderBy(desc(userStats.lastUpdated));
  }
  
  async updateUserStats(userId: string, subject: string): Promise<UserStats> {
    // Calculate stats from user answers
    const stats = await db
      .select({
        totalQuestions: count(userAnswers.id),
        correctAnswers: sum(sql`CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END`),
        averageTime: avg(userAnswers.timeSpent),
      })
      .from(userAnswers)
      .innerJoin(questions, eq(userAnswers.questionId, questions.id))
      .where(and(
        eq(userAnswers.userId, userId),
        eq(questions.subject, subject)
      ));
    
    const totalQuestions = Number(stats[0]?.totalQuestions || 0);
    const correctAnswers = Number(stats[0]?.correctAnswers || 0);
    const successRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageTime = Number(stats[0]?.averageTime || 0);
    
    // Upsert user stats
    const [existingStats] = await db
      .select()
      .from(userStats)
      .where(and(
        eq(userStats.userId, userId),
        eq(userStats.subject, subject)
      ));
    
    if (existingStats) {
      const [updatedStats] = await db
        .update(userStats)
        .set({
          totalQuestions,
          correctAnswers,
          successRate: successRate.toFixed(2),
          averageTime: averageTime.toFixed(2),
          lastUpdated: new Date(),
        })
        .where(and(
          eq(userStats.userId, userId),
          eq(userStats.subject, subject)
        ))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(userStats)
        .values({
          userId,
          subject,
          totalQuestions,
          correctAnswers,
          successRate: successRate.toFixed(2),
          averageTime: averageTime.toFixed(2),
        })
        .returning();
      return newStats;
    }
  }
  
  // Helper function to update question statistics
  private async updateQuestionStats(questionId: string): Promise<void> {
    const stats = await db
      .select({
        totalAttempts: count(userAnswers.id),
        correctAnswers: sum(sql`CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END`),
      })
      .from(userAnswers)
      .where(eq(userAnswers.questionId, questionId));
    
    const totalAttempts = Number(stats[0]?.totalAttempts || 0);
    const correctAnswers = Number(stats[0]?.correctAnswers || 0);
    const successRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
    
    await db
      .update(questions)
      .set({
        totalAttempts,
        successRate: successRate.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));
  }
}

export const storage = new DatabaseStorage();
