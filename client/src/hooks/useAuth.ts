import { useFirebaseAuth } from './useFirebaseAuth';
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
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
