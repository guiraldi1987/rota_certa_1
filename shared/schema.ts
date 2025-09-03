import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User onboarding and preferences
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userType: varchar("user_type").$type<"concurseiro" | "militar">(),
  goals: text("goals").array(),
  weeklyHours: varchar("weekly_hours"),
  studyTimes: text("study_times").array(),
  subjects: text("subjects").array(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questions table - Central repository for all exam questions
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  statement: text("statement").notNull(),
  alternatives: jsonb("alternatives").$type<{ id: string; text: string; }[]>().notNull(),
  correctAlternative: varchar("correct_alternative").notNull(),
  explanation: text("explanation"),
  subject: varchar("subject").notNull(), // disciplina
  examBoard: varchar("exam_board"), // banca
  examYear: integer("exam_year"),
  examType: varchar("exam_type"), // tipo de prova
  difficulty: varchar("difficulty").$type<"easy" | "medium" | "hard">().default("medium"),
  tags: text("tags").array(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage of correct answers
  totalAttempts: integer("total_attempts").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Simulados table - Generated practice exams
export const simulados = pgTable("simulados", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  type: varchar("type").$type<"diagnostic" | "practice" | "mock_exam">().default("practice"),
  subjects: text("subjects").array(), // subjects included
  totalQuestions: integer("total_questions").notNull(),
  timeLimit: integer("time_limit"), // in minutes
  difficulty: varchar("difficulty").$type<"adaptive" | "easy" | "medium" | "hard">().default("adaptive"),
  status: varchar("status").$type<"not_started" | "in_progress" | "completed" | "abandoned">().default("not_started"),
  score: decimal("score", { precision: 5, scale: 2 }), // percentage score
  correctAnswers: integer("correct_answers").default(0),
  timeSpent: integer("time_spent"), // in seconds
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User answers for questions (both in simulados and standalone practice)
export const userAnswers = pgTable("user_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  simuladoId: varchar("simulado_id").references(() => simulados.id, { onDelete: "cascade" }), // nullable for standalone practice
  selectedAlternative: varchar("selected_alternative").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // time spent on this question in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// User performance statistics
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject").notNull(),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  averageTime: decimal("average_time", { precision: 8, scale: 2 }), // average time per question in seconds
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => [
  index("idx_user_stats_user_subject").on(table.userId, table.subject),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  profile: many(userProfiles),
  simulados: many(simulados),
  answers: many(userAnswers),
  stats: many(userStats),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  answers: many(userAnswers),
}));

export const simuladosRelations = relations(simulados, ({ one, many }) => ({
  user: one(users, {
    fields: [simulados.userId],
    references: [users.id],
  }),
  answers: many(userAnswers),
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  user: one(users, {
    fields: [userAnswers.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [userAnswers.questionId],
    references: [questions.id],
  }),
  simulado: one(simulados, {
    fields: [userAnswers.simuladoId],
    references: [simulados.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export type Simulado = typeof simulados.$inferSelect;
export type InsertSimulado = typeof simulados.$inferInsert;

export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserAnswer = typeof userAnswers.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

// Zod schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  successRate: true,
  totalAttempts: true,
});

export const insertSimuladoSchema = createInsertSchema(simulados).omit({
  id: true,
  createdAt: true,
  userId: true,
  score: true,
  correctAnswers: true,
  timeSpent: true,
  startedAt: true,
  completedAt: true,
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertQuestionType = z.infer<typeof insertQuestionSchema>;
export type InsertSimuladoType = z.infer<typeof insertSimuladoSchema>;
export type InsertUserAnswerType = z.infer<typeof insertUserAnswerSchema>;
