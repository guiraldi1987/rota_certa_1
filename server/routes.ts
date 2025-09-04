import type { Express } from "express";
import { createServer, type Server } from "http";
import { firestoreStorage } from "./firestore-storage";
import { setupFirebaseAuth, isAuthenticated } from "./firebaseAuth";
import { 
  userProfileSchema, 
  questionSchema,
  simuladoSchema,
  userAnswerSchema,
  type Question,
  type Simulado,
} from "@shared/firestore-schema";
import { db, auth } from './firebase';
import { Timestamp } from 'firebase-admin/firestore';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupFirebaseAuth(app);

  // Test Firebase connection
  app.get('/api/test-firebase', async (req, res) => {
    try {
      // Test Firestore connection
      await db.collection('test').doc('connection').set({ timestamp: Timestamp.now() });
      const testDoc = await db.collection('test').doc('connection').get();
      if (!testDoc.exists) {
        throw new Error('Failed to read test document');
      }
      
      // Test Auth (just verify if initialized)
      await auth.getUserByEmail('test@example.com').catch(() => {}); // Expected to fail, but tests initialization
      
      res.json({ status: 'success', message: 'Firebase connection is working' });
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Firebase connection failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Auth routes are now handled by setupFirebaseAuth

  // User profile routes
  app.post('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const profileData = userProfileSchema.parse(req.body);
      
      // Check if profile already exists
      const existingProfile = await firestoreStorage.getUserProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await firestoreStorage.updateUserProfile(userId, profileData);
      } else {
        profile = await firestoreStorage.createUserProfile({ ...profileData, userId });
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
      const userId = req.user.uid;
      
      const profile = await firestoreStorage.updateUserProfile(userId, {
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
      
      const questions = await firestoreStorage.getQuestions({
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
      const question = await firestoreStorage.getQuestion(id);
      
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
      const questionData = questionSchema.parse(req.body);
      const question = await firestoreStorage.createQuestion(questionData);
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
      const userId = req.user.uid;
      const simulados = await firestoreStorage.getSimulados(userId);
      res.json(simulados);
    } catch (error) {
      console.error("Error fetching simulados:", error);
      res.status(500).json({ message: "Failed to fetch simulados" });
    }
  });

  app.get('/api/simulados/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const simulado = await firestoreStorage.getSimulado(id);
      
      if (!simulado) {
        return res.status(404).json({ message: "Simulado not found" });
      }
      
      // Check if user owns this simulado
      const userId = req.user.uid;
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
      const userId = req.user.uid;
      const simuladoData = simuladoSchema.parse(req.body);
      
      const simulado = await firestoreStorage.createSimulado({ ...simuladoData, userId });
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
      const userId = req.user.uid;
      
      // Check if user owns this simulado
      const existingSimulado = await firestoreStorage.getSimulado(id);
      if (!existingSimulado || existingSimulado.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = req.body;
      const simulado = await firestoreStorage.updateSimulado(id, updateData);
      res.json(simulado);
    } catch (error) {
      console.error("Error updating simulado:", error);
      res.status(500).json({ message: "Failed to update simulado" });
    }
  });

  // Generate intelligent simulado
  app.post('/api/simulados/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { subjects, totalQuestions = 20, difficulty = "adaptive", title } = req.body;
      
      // Get user profile to understand their preferences
      const userProfile = await firestoreStorage.getUserProfile(userId);
      const userSubjects = subjects || userProfile?.subjects || [];
      
      if (userSubjects.length === 0) {
        return res.status(400).json({ message: "No subjects specified" });
      }
      
      // Generate questions based on user performance
      let questionsPool: Question[] = [];
      
      if (difficulty === "adaptive") {
        // Get user stats to determine adaptive difficulty
        const userStats = await firestoreStorage.getUserStats(userId);
        
        for (const subject of userSubjects) {
          const subjectStats = userStats.find(s => s.subject === subject);
          let subjectDifficulty: "easy" | "medium" | "hard" = "medium";
          
          if (subjectStats && subjectStats.successRate) {
            const successRate = parseFloat(subjectStats.successRate.toString());
            if (successRate < 40) subjectDifficulty = "easy";
            else if (successRate > 70) subjectDifficulty = "hard";
          }
          
          const subjectQuestions = await firestoreStorage.getQuestions({
            subject,
            difficulty: subjectDifficulty,
            limit: Math.ceil(totalQuestions / userSubjects.length),
          });
          
          questionsPool = questionsPool.concat(subjectQuestions);
        }
      } else {
        // Use specified difficulty
        for (const subject of userSubjects) {
          const subjectQuestions = await firestoreStorage.getQuestions({
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
      const simulado = await firestoreStorage.createSimulado({
        userId,
        title: title || `Simulado Inteligente - ${new Date().toLocaleDateString('pt-BR')}`,
        type: "practice",
        subjects: userSubjects,
        totalQuestions: selectedQuestions.length,
        timeLimit: totalQuestions * 2, // 2 minutes per question
        difficulty,
      });
      
      res.status(201).json({ simulado, questions: selectedQuestions });
    } catch (error) {
      console.error("Error generating simulado:", error);
      res.status(500).json({ message: "Failed to generate simulado" });
    }
  });

  // User answers routes
  app.post('/api/answers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const answerData = userAnswerSchema.parse(req.body);
      
      const answer = await firestoreStorage.createUserAnswer({ ...answerData, userId });
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
      const userId = req.user.uid;
      const { questionId, simuladoId } = req.query;
      
      const answers = await firestoreStorage.getUserAnswers(
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
      const userId = req.user.uid;
      const { subject } = req.query;
      
      const stats = await firestoreStorage.getUserStats(userId, subject as string);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
