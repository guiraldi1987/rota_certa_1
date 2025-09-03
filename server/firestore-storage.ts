import { db } from './firebase';
import { Timestamp } from 'firebase-admin/firestore';
import {
  User,
  UserProfile,
  Question,
  Simulado,
  UserAnswer,
  UserStats,
  CreateUserProfile,
  CreateQuestion,
  CreateSimulado,
  CreateUserAnswer,
  COLLECTIONS
} from '@shared/firestore-schema';

class FirestoreStorage {
  // User operations
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
      if (!userDoc.exists) return null;
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const now = Timestamp.now();
      const userRef = await db.collection(COLLECTIONS.USERS).add({
        ...userData,
        createdAt: now,
        updatedAt: now
      });
      
      return {
        id: userRef.id,
        ...userData,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      await userRef.update({
        ...userData,
        updatedAt: Timestamp.now()
      });
      
      const updatedUser = await this.getUser(userId);
      if (!updatedUser) throw new Error('User not found after update');
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // User Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileQuery = db.collection(COLLECTIONS.USER_PROFILES)
        .where('userId', '==', userId);
      const profileDocs = await profileQuery.get();
      
      if (profileDocs.empty) return null;
      
      const profileDoc = profileDocs.docs[0];
      return {
        id: profileDoc.id,
        ...profileDoc.data()
      } as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async createUserProfile(profileData: CreateUserProfile & { userId: string }): Promise<UserProfile> {
    try {
      const now = Timestamp.now();
      const profileRef = await db.collection(COLLECTIONS.USER_PROFILES).add({
        ...profileData,
        createdAt: now,
        updatedAt: now
      });
      
      return {
        id: profileRef.id,
        ...profileData,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<CreateUserProfile>): Promise<UserProfile> {
    try {
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        throw new Error('User profile not found');
      }
      
      const profileRef = db.collection(COLLECTIONS.USER_PROFILES).doc(existingProfile.id);
      await profileRef.update({
        ...profileData,
        updatedAt: Timestamp.now()
      });
      
      const updatedProfile = await this.getUserProfile(userId);
      if (!updatedProfile) throw new Error('Profile not found after update');
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Question operations
  async getQuestions(filters: {
    subject?: string;
    examBoard?: string;
    examYear?: number;
    examType?: string;
    difficulty?: "easy" | "medium" | "hard";
    limit?: number;
    offset?: number;
  } = {}): Promise<Question[]> {
    try {
      let questionQuery = db.collection(COLLECTIONS.QUESTIONS);
      
      // Apply filters
      if (filters.subject) {
        questionQuery = questionQuery.where('subject', '==', filters.subject);
      }
      if (filters.examBoard) {
        questionQuery = questionQuery.where('examBoard', '==', filters.examBoard);
      }
      if (filters.examYear) {
        questionQuery = questionQuery.where('examYear', '==', filters.examYear);
      }
      if (filters.examType) {
        questionQuery = questionQuery.where('examType', '==', filters.examType);
      }
      if (filters.difficulty) {
        questionQuery = questionQuery.where('difficulty', '==', filters.difficulty);
      }
      
      // Add active filter
      questionQuery = questionQuery.where('isActive', '==', true);
      
      // Add ordering and limit
      questionQuery = questionQuery.orderBy('createdAt', 'desc');
      
      if (filters.limit) {
        questionQuery = questionQuery.limit(filters.limit);
      }
      
      const questionDocs = await questionQuery.get();
      
      return questionDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question));
    } catch (error) {
      console.error('Error getting questions:', error);
      throw error;
    }
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    try {
      const questionDoc = await db.collection(COLLECTIONS.QUESTIONS).doc(questionId).get();
      if (!questionDoc.exists) return null;
      
      return {
        id: questionDoc.id,
        ...questionDoc.data()
      } as Question;
    } catch (error) {
      console.error('Error getting question:', error);
      throw error;
    }
  }

  async createQuestion(questionData: CreateQuestion): Promise<Question> {
    try {
      const now = Timestamp.now();
      const questionRef = await db.collection(COLLECTIONS.QUESTIONS).add({
        ...questionData,
        successRate: 0,
        totalAttempts: 0,
        createdAt: now,
        updatedAt: now
      });
      
      return {
        id: questionRef.id,
        ...questionData,
        successRate: 0,
        totalAttempts: 0,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  // Simulado operations
  async getSimulados(userId: string): Promise<Simulado[]> {
    try {
      const simuladoQuery = db.collection(COLLECTIONS.SIMULADOS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');
      
      const simuladoDocs = await simuladoQuery.get();
      
      return simuladoDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Simulado));
    } catch (error) {
      console.error('Error getting simulados:', error);
      throw error;
    }
  }

  async getSimulado(simuladoId: string): Promise<Simulado | null> {
    try {
      const simuladoDoc = await db.collection(COLLECTIONS.SIMULADOS).doc(simuladoId).get();
      if (!simuladoDoc.exists) return null;
      
      return {
        id: simuladoDoc.id,
        ...simuladoDoc.data()
      } as Simulado;
    } catch (error) {
      console.error('Error getting simulado:', error);
      throw error;
    }
  }

  async createSimulado(simuladoData: CreateSimulado & { userId: string }): Promise<Simulado> {
    try {
      const now = Timestamp.now();
      const simuladoRef = await db.collection(COLLECTIONS.SIMULADOS).add({
        ...simuladoData,
        status: 'not_started',
        correctAnswers: 0,
        questionIds: [],
        createdAt: now,
        updatedAt: now
      });
      
      return {
        id: simuladoRef.id,
        ...simuladoData,
        status: 'not_started',
        correctAnswers: 0,
        questionIds: [],
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating simulado:', error);
      throw error;
    }
  }

  async updateSimulado(simuladoId: string, simuladoData: Partial<Simulado>): Promise<Simulado> {
    try {
      const simuladoRef = db.collection(COLLECTIONS.SIMULADOS).doc(simuladoId);
      await simuladoRef.update({
        ...simuladoData,
        updatedAt: Timestamp.now()
      });
      
      const updatedSimulado = await this.getSimulado(simuladoId);
      if (!updatedSimulado) throw new Error('Simulado not found after update');
      
      return updatedSimulado;
    } catch (error) {
      console.error('Error updating simulado:', error);
      throw error;
    }
  }

  // User Answer operations
  async createUserAnswer(answerData: CreateUserAnswer & { userId: string }): Promise<UserAnswer> {
    try {
      const now = Timestamp.now();
      const answerRef = await db.collection(COLLECTIONS.USER_ANSWERS).add({
        ...answerData,
        createdAt: now,
        updatedAt: now
      });
      
      return {
        id: answerRef.id,
        ...answerData,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating user answer:', error);
      throw error;
    }
  }

  async getUserAnswers(userId: string, questionId?: string, simuladoId?: string): Promise<UserAnswer[]> {
    try {
      let answerQuery = db.collection(COLLECTIONS.USER_ANSWERS)
        .where('userId', '==', userId);
      
      if (questionId) {
        answerQuery = answerQuery.where('questionId', '==', questionId);
      }
      
      if (simuladoId) {
        answerQuery = answerQuery.where('simuladoId', '==', simuladoId);
      }
      
      answerQuery = answerQuery.orderBy('createdAt', 'desc');
      
      const answerDocs = await answerQuery.get();
      
      return answerDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserAnswer));
    } catch (error) {
      console.error('Error getting user answers:', error);
      throw error;
    }
  }

  // User Stats operations
  async getUserStats(userId: string, subject?: string): Promise<UserStats[]> {
    try {
      let statsQuery = db.collection(COLLECTIONS.USER_STATS)
        .where('userId', '==', userId);
      
      if (subject) {
        statsQuery = statsQuery.where('subject', '==', subject);
      }
      
      const statsDocs = await statsQuery.get();
      
      return statsDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserStats));
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async updateUserStats(userId: string, subject: string, statsData: Partial<UserStats>): Promise<UserStats> {
    try {
      // Find existing stats for this user and subject
      const existingStatsQuery = db.collection(COLLECTIONS.USER_STATS)
        .where('userId', '==', userId)
        .where('subject', '==', subject);
      
      const existingStatsDocs = await existingStatsQuery.get();
      
      const now = Timestamp.now();
      
      if (existingStatsDocs.empty) {
        // Create new stats
        const statsRef = await db.collection(COLLECTIONS.USER_STATS).add({
          userId,
          subject,
          totalQuestions: 0,
          correctAnswers: 0,
          averageTime: 0,
          successRate: 0,
          ...statsData,
          createdAt: now,
          updatedAt: now,
          lastUpdated: now
        });
        
        return {
          id: statsRef.id,
          userId,
          subject,
          totalQuestions: 0,
          correctAnswers: 0,
          averageTime: 0,
          successRate: 0,
          ...statsData,
          createdAt: now,
          updatedAt: now,
          lastUpdated: now
        };
      } else {
        // Update existing stats
        const existingStats = existingStatsDocs.docs[0];
        const statsRef = db.collection(COLLECTIONS.USER_STATS).doc(existingStats.id);
        
        await statsRef.update({
          ...statsData,
          updatedAt: now,
          lastUpdated: now
        });
        
        const updatedStatsDoc = await statsRef.get();
        return {
          id: updatedStatsDoc.id,
          ...updatedStatsDoc.data()
        } as UserStats;
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }
}

export const firestoreStorage = new FirestoreStorage();