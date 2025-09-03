import { Button } from "@/components/ui/button";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { signOut, isLoading } = useFirebaseAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      {isLoading ? 'Saindo...' : 'Sair'}
    </Button>
  );
}