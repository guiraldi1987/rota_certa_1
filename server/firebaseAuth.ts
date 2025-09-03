import { auth } from './firebase';
import type { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { firestoreStorage } from './firestore-storage';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        displayName?: string;
        photoURL?: string;
      };
    }
  }
}

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  return session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Middleware to verify Firebase ID token
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email!,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
    };

    // Ensure user exists in Firestore
    await ensureUserExists(req.user);
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Alternative middleware for session-based auth (for compatibility)
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).user) {
    req.user = (req.session as any).user;
    return next();
  }
  
  // Try token-based auth as fallback
  return verifyFirebaseToken(req, res, next);
};

// Ensure user exists in Firestore
async function ensureUserExists(user: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await firestoreStorage.getUser(user.uid);
    
    if (!existingUser) {
      // Create new user
      await firestoreStorage.createUser({
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: user.photoURL,
      });
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

// Setup Firebase Auth routes
export function setupFirebaseAuth(app: Express) {
  app.use(getSession());

  // Login endpoint - receives Firebase ID token from frontend
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }

      // Verify the ID token
      const decodedToken = await auth.verifyIdToken(idToken);
      
      const user = {
        uid: decodedToken.uid,
        email: decodedToken.email!,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
      };

      // Store user in session
      (req.session as any).user = user;
      
      // Ensure user exists in Firestore
      await ensureUserExists(user);
      
      res.json({ 
        message: 'Login successful',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Get user from Firestore
      const user = await firestoreStorage.getUser(req.user.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user profile if it exists
      const profile = await firestoreStorage.getUserProfile(req.user.uid);
      
      res.json({ 
        ...user, 
        profile: profile || null,
        hasCompletedOnboarding: profile?.onboardingCompleted || false
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });
}