import { z } from "zod";
import { Timestamp } from 'firebase/firestore';

// Tipos base para Firestore
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Document
export interface User extends FirestoreDocument {
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// User Profile Document
export interface UserProfile extends FirestoreDocument {
  userId: string;
  userType: "concurseiro" | "militar";
  goals: string[];
  weeklyHours: string;
  studyTimes: string[];
  subjects: string[];
  onboardingCompleted: boolean;
}

// Question Document
export interface Question extends FirestoreDocument {
  title: string;
  statement: string;
  alternatives: { id: string; text: string; }[];
  correctAlternative: string;
  explanation?: string;
  subject: string;
  examBoard?: string;
  examYear?: number;
  examType?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  successRate: number;
  totalAttempts: number;
  isActive: boolean;
}

// Simulado Document
export interface Simulado extends FirestoreDocument {
  userId: string;
  title: string;
  type: "diagnostic" | "practice" | "mock_exam";
  subjects: string[];
  totalQuestions: number;
  timeLimit?: number; // in minutes
  difficulty: "adaptive" | "easy" | "medium" | "hard";
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  score?: number; // percentage score
  correctAnswers: number;
  timeSpent?: number; // in seconds
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  questionIds: string[]; // Array of question IDs for this simulado
}

// User Answer Document
export interface UserAnswer extends FirestoreDocument {
  userId: string;
  questionId: string;
  simuladoId?: string; // nullable for standalone practice
  selectedAlternative: string;
  isCorrect: boolean;
  timeSpent?: number; // time spent on this question in seconds
}

// User Stats Document
export interface UserStats extends FirestoreDocument {
  userId: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number; // average time per question in seconds
  successRate: number;
  lastUpdated: Timestamp;
}

// Zod schemas for validation
export const userProfileSchema = z.object({
  userType: z.enum(["concurseiro", "militar"]),
  goals: z.array(z.string()),
  weeklyHours: z.string(),
  studyTimes: z.array(z.string()),
  subjects: z.array(z.string()),
  onboardingCompleted: z.boolean().default(false),
});

export const questionSchema = z.object({
  title: z.string(),
  statement: z.string(),
  alternatives: z.array(z.object({
    id: z.string(),
    text: z.string(),
  })),
  correctAlternative: z.string(),
  explanation: z.string().optional(),
  subject: z.string(),
  examBoard: z.string().optional(),
  examYear: z.number().optional(),
  examType: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const simuladoSchema = z.object({
  title: z.string(),
  type: z.enum(["diagnostic", "practice", "mock_exam"]).default("practice"),
  subjects: z.array(z.string()),
  totalQuestions: z.number(),
  timeLimit: z.number().optional(),
  difficulty: z.enum(["adaptive", "easy", "medium", "hard"]).default("adaptive"),
});

export const userAnswerSchema = z.object({
  questionId: z.string(),
  simuladoId: z.string().optional(),
  selectedAlternative: z.string(),
  isCorrect: z.boolean(),
  timeSpent: z.number().optional(),
});

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  USER_PROFILES: 'userProfiles',
  QUESTIONS: 'questions',
  SIMULADOS: 'simulados',
  USER_ANSWERS: 'userAnswers',
  USER_STATS: 'userStats',
} as const;

// Helper types
export type CreateUserProfile = z.infer<typeof userProfileSchema>;
export type CreateQuestion = z.infer<typeof questionSchema>;
export type CreateSimulado = z.infer<typeof simuladoSchema>;
export type CreateUserAnswer = z.infer<typeof userAnswerSchema>;