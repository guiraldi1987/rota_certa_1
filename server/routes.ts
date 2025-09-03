import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserProfileSchema, 
  insertQuestionSchema,
  insertSimuladoSchema,
  insertUserAnswerSchema,
  type Question,
  type Simulado,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Also get user profile if it exists
      const profile = await storage.getUserProfile(userId);
      
      res.json({ 
        ...user, 
        profile: profile || null,
        hasCompletedOnboarding: profile?.onboardingCompleted || false
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.post('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.parse(req.body);
      
      // Check if profile already exists
      const existingProfile = await storage.getUserProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateUserProfile(userId, profileData);
      } else {
        profile = await storage.createUserProfile({ ...profileData, userId });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error creating/updating user profile:", error);
      res.status(500).json({ message: "Failed to save user profile" });
    }
  });

  app.patch('/api/user/profile/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const profile = await storage.updateUserProfile(userId, {
        onboardingCompleted: true
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Questions routes
  app.get('/api/questions', isAuthenticated, async (req, res) => {
    try {
      const { subject, examBoard, examYear, examType, difficulty, limit = 20, offset = 0 } = req.query;
      
      const questions = await storage.getQuestions({
        subject: subject as string,
        examBoard: examBoard as string,
        examYear: examYear ? parseInt(examYear as string) : undefined,
        examType: examType as string,
        difficulty: difficulty as "easy" | "medium" | "hard",
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/questions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  app.post('/api/questions', isAuthenticated, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData as any);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Simulados routes
  app.get('/api/simulados', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const simulados = await storage.getSimulados(userId);
      res.json(simulados);
    } catch (error) {
      console.error("Error fetching simulados:", error);
      res.status(500).json({ message: "Failed to fetch simulados" });
    }
  });

  app.get('/api/simulados/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const simulado = await storage.getSimulado(id);
      
      if (!simulado) {
        return res.status(404).json({ message: "Simulado not found" });
      }
      
      // Check if user owns this simulado
      const userId = req.user.claims.sub;
      if (simulado.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(simulado);
    } catch (error) {
      console.error("Error fetching simulado:", error);
      res.status(500).json({ message: "Failed to fetch simulado" });
    }
  });

  app.post('/api/simulados', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const simuladoData = insertSimuladoSchema.parse(req.body);
      
      const simulado = await storage.createSimulado({ ...simuladoData, userId } as any);
      res.status(201).json(simulado);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid simulado data", errors: error.errors });
      }
      console.error("Error creating simulado:", error);
      res.status(500).json({ message: "Failed to create simulado" });
    }
  });

  app.patch('/api/simulados/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user owns this simulado
      const existingSimulado = await storage.getSimulado(id);
      if (!existingSimulado || existingSimulado.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = req.body;
      const simulado = await storage.updateSimulado(id, updateData);
      res.json(simulado);
    } catch (error) {
      console.error("Error updating simulado:", error);
      res.status(500).json({ message: "Failed to update simulado" });
    }
  });

  // Generate intelligent simulado
  app.post('/api/simulados/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subjects, totalQuestions = 20, difficulty = "adaptive", title } = req.body;
      
      // Get user profile to understand their preferences
      const userProfile = await storage.getUserProfile(userId);
      const userSubjects = subjects || userProfile?.subjects || [];
      
      if (userSubjects.length === 0) {
        return res.status(400).json({ message: "No subjects specified" });
      }
      
      // Generate questions based on user performance
      let questionsPool: Question[] = [];
      
      if (difficulty === "adaptive") {
        // Get user stats to determine adaptive difficulty
        const userStats = await storage.getUserStats(userId);
        
        for (const subject of userSubjects) {
          const subjectStats = userStats.find(s => s.subject === subject);
          let subjectDifficulty: "easy" | "medium" | "hard" = "medium";
          
          if (subjectStats && subjectStats.successRate) {
            const successRate = parseFloat(subjectStats.successRate);
            if (successRate < 40) subjectDifficulty = "easy";
            else if (successRate > 70) subjectDifficulty = "hard";
          }
          
          const subjectQuestions = await storage.getQuestions({
            subject,
            difficulty: subjectDifficulty,
            limit: Math.ceil(totalQuestions / userSubjects.length),
          });
          
          questionsPool = questionsPool.concat(subjectQuestions);
        }
      } else {
        // Use specified difficulty
        for (const subject of userSubjects) {
          const subjectQuestions = await storage.getQuestions({
            subject,
            difficulty: difficulty as "easy" | "medium" | "hard",
            limit: Math.ceil(totalQuestions / userSubjects.length),
          });
          
          questionsPool = questionsPool.concat(subjectQuestions);
        }
      }
      
      // Shuffle and limit questions
      const shuffledQuestions = questionsPool.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, totalQuestions);
      
      // Create simulado
      const simulado = await storage.createSimulado({
        userId,
        title: title || `Simulado Inteligente - ${new Date().toLocaleDateString('pt-BR')}`,
        type: "practice",
        subjects: userSubjects,
        totalQuestions: selectedQuestions.length,
        timeLimit: totalQuestions * 2, // 2 minutes per question
        difficulty,
        status: "not_started",
      } as any);
      
      res.status(201).json({ simulado, questions: selectedQuestions });
    } catch (error) {
      console.error("Error generating simulado:", error);
      res.status(500).json({ message: "Failed to generate simulado" });
    }
  });

  // User answers routes
  app.post('/api/answers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const answerData = insertUserAnswerSchema.parse(req.body);
      
      const answer = await storage.createUserAnswer({ ...answerData, userId });
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      console.error("Error saving answer:", error);
      res.status(500).json({ message: "Failed to save answer" });
    }
  });

  app.get('/api/answers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { questionId, simuladoId } = req.query;
      
      const answers = await storage.getUserAnswers(
        userId,
        questionId as string,
        simuladoId as string
      );
      
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  // Statistics routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject } = req.query;
      
      const stats = await storage.getUserStats(userId, subject as string);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
