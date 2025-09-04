import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      console.log('🔍 [DEBUG] onAuthStateChanged disparado:', firebaseUser ? 'usuário logado' : 'usuário deslogado');
      setIsLoading(true);
      
      if (firebaseUser) {
        console.log('🔍 [DEBUG] onAuthStateChanged: Usuário encontrado:', firebaseUser.uid);
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        };
        
        setUser(authUser);
        
        // Send ID token to backend for session creation
        try {
          console.log('🔍 [DEBUG] onAuthStateChanged: Enviando token para backend');
          const idToken = await firebaseUser.getIdToken();
          await apiRequest('POST', '/api/auth/login', { idToken });
          console.log('✅ [DEBUG] onAuthStateChanged: Token enviado com sucesso');
        } catch (error) {
          console.error('❌ [DEBUG] onAuthStateChanged: Erro ao enviar token:', error);
        }
      } else {
        console.log('🔍 [DEBUG] onAuthStateChanged: Nenhum usuário, limpando estado');
        setUser(null);
      }
      
      setIsLoading(false);
      console.log('🔍 [DEBUG] onAuthStateChanged: Loading finalizado');
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      
      // User state will be updated by onAuthStateChanged
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Notify backend
      try {
        await apiRequest('POST', '/api/auth/logout');
      } catch (error) {
        console.error('Error notifying backend of logout:', error);
      }
      
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      console.log('🔍 [DEBUG] useFirebaseAuth: Iniciando createUserWithEmailAndPassword');
      console.log('🔍 [DEBUG] useFirebaseAuth: Email:', email);
      console.log('🔍 [DEBUG] useFirebaseAuth: DisplayName:', displayName);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ [DEBUG] useFirebaseAuth: Usuário criado com sucesso:', result.user.uid);
      
      console.log('🔍 [DEBUG] useFirebaseAuth: Atualizando perfil do usuário');
      await updateProfile(result.user, { displayName });
      console.log('✅ [DEBUG] useFirebaseAuth: Perfil atualizado com sucesso');
      
      return result.user;
    } catch (error) {
      console.error('❌ [DEBUG] useFirebaseAuth: Erro no registro:', error);
      console.error('❌ [DEBUG] useFirebaseAuth: Código do erro:', (error as any)?.code);
      console.error('❌ [DEBUG] useFirebaseAuth: Mensagem do erro:', (error as any)?.message);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    signOut,
  };
}