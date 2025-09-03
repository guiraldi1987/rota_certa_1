import { useFirebaseAuth } from './useFirebaseAuth';
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Modo de desenvolvimento - retorna dados mockados
  const isDevelopmentMode = true; // Altere para false para reativar autenticação
  
  if (isDevelopmentMode) {
    return {
      user: {
        id: 'dev-user',
        email: 'dev@rotacerta.com',
        firstName: 'Usuário',
        lastName: 'Desenvolvimento',
        hasCompletedOnboarding: true,
        profile: {
          userType: 'concurseiro' as const,
          goals: ['Aprovação em concurso'],
          weeklyHours: '20-30 horas',
          studyTimes: ['Manhã'],
          subjects: ['Direito Constitucional', 'Direito Administrativo'],
          onboardingCompleted: true
        }
      },
      isLoading: false,
      isAuthenticated: true,
      firebaseUser: null,
    };
  }

  const { user: firebaseUser, isLoading: firebaseLoading, isAuthenticated } = useFirebaseAuth();
  
  // Get user profile data from backend when authenticated
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    user: userProfile || firebaseUser,
    isLoading: firebaseLoading || profileLoading,
    isAuthenticated,
    firebaseUser,
  };
}
