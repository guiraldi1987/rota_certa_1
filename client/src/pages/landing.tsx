import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/floating-input";
import { TermsModal } from "@/components/modals/terms-modal";
import { PrivacyModal } from "@/components/modals/privacy-modal";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { MapPin, Shield, CheckCircle } from "lucide-react";

export default function Landing() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  
  const { signInWithEmail, registerWithEmail, isLoading } = useFirebaseAuth();

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(formData.email, formData.password);
      // Redirecionar ou atualizar estado após login bem-sucedido
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    if (!formData.termsAccepted) {
      alert('Você deve aceitar os termos e política de privacidade.');
      return;
    }
    try {
      await registerWithEmail(formData.email, formData.password, formData.fullName);
      // Redirecionar ou atualizar estado após registro bem-sucedido
    } catch (error) {
      console.error('Erro no registro:', error);
      alert('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">ROTA CERTA</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          {isLoginMode ? (
            <>
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo ao ROTA CERTA</h2>
                <p className="text-muted-foreground">Sua plataforma completa para preparação de concursos e progressão na PMESP</p>
              </div>

              {/* Login Form */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleLogin(e); }} className="space-y-4">
                    <FloatingInput
                      type="email"
                      name="email"
                      label="E-mail"
                      value={formData.email}
                      onChange={(value) => handleInputChange("email", value)}
                      required
                    />

                    <FloatingInput
                      type="password"
                      name="password"
                      label="Senha"
                      value={formData.password}
                      onChange={(value) => handleInputChange("password", value)}
                      required
                    />

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-ring" />
                        <span className="text-muted-foreground">Lembrar de mim</span>
                      </label>
                      <button type="button" className="text-primary hover:underline">
                        Esqueci minha senha
                      </button>
                    </div>

                    <Button type="submit" className="w-full" data-testid="button-login">
                      Entrar
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou continue com</span>
                  </div>
                </div>

                <GoogleLoginButton />
              </div>

              {/* Registration Link */}
              <div className="text-center">
                <p className="text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button 
                    className="text-primary hover:underline font-medium"
                    onClick={() => setIsLoginMode(false)}
                    data-testid="link-register"
                  >
                    Criar conta
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Registration Screen */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Criar Conta</h2>
                <p className="text-muted-foreground">Comece sua jornada na PMESP hoje mesmo</p>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <form onSubmit={handleRegistration} className="space-y-4">
                    <FloatingInput
                      type="text"
                      name="fullName"
                      label="Nome completo"
                      value={formData.fullName}
                      onChange={(value) => handleInputChange("fullName", value)}
                      required
                      data-testid="input-fullname"
                    />

                    <FloatingInput
                      type="email"
                      name="email"
                      label="E-mail"
                      value={formData.email}
                      onChange={(value) => handleInputChange("email", value)}
                      required
                      data-testid="input-email"
                    />

                    <FloatingInput
                      type="password"
                      name="password"
                      label="Senha"
                      value={formData.password}
                      onChange={(value) => handleInputChange("password", value)}
                      required
                      data-testid="input-password"
                    />

                    <FloatingInput
                      type="password"
                      name="confirmPassword"
                      label="Confirmar senha"
                      value={formData.confirmPassword}
                      onChange={(value) => handleInputChange("confirmPassword", value)}
                      required
                      data-testid="input-confirm-password"
                    />

                    <div className="flex items-start space-x-2">
                      <input 
                        type="checkbox" 
                        id="terms" 
                        className="mt-1 rounded border-border text-primary focus:ring-ring"
                        checked={formData.termsAccepted}
                        onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                        required
                        data-testid="checkbox-terms"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        Eu concordo com os{" "}
                        <button 
                          type="button" 
                          className="text-primary hover:underline"
                          onClick={() => setShowTerms(true)}
                          data-testid="link-terms"
                        >
                          Termos de Uso
                        </button>{" "}
                        e{" "}
                        <button 
                          type="button" 
                          className="text-primary hover:underline"
                          onClick={() => setShowPrivacy(true)}
                          data-testid="link-privacy"
                        >
                          Política de Privacidade
                        </button>
                      </label>
                    </div>

                    <Button type="submit" className="w-full" data-testid="button-register">
                      Criar Conta
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button 
                    className="text-primary hover:underline font-medium"
                    onClick={() => setIsLoginMode(true)}
                    data-testid="link-login"
                  >
                    Fazer login
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}
