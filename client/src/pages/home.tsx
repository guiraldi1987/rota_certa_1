import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart3, Calendar, Trophy, User, Target, Clock, Award, BookOpen, TrendingUp } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userData } = useQuery<{
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    profile?: {
      userType: "concurseiro" | "militar";
      goals: string[];
      weeklyHours: string;
      studyTimes: string[];
      subjects: string[];
      onboardingCompleted: boolean;
    } | null;
    hasCompletedOnboarding: boolean;
  }>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // If user hasn't completed onboarding, redirect to onboarding
  if (userData && !userData.hasCompletedOnboarding) {
    setLocation("/onboarding");
    return null;
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Olá, {userData?.firstName || "Usuário"}! Continue seu progresso.
              </p>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {userData?.firstName} {userData?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userData?.profile?.userType === "concurseiro" ? "Concurseiro" : "Militar"}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {getInitials(userData?.firstName, userData?.lastName)}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Progress Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Progresso Geral</h3>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conclusão</span>
                  <span className="font-medium text-foreground">0%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comece seus estudos para ver seu progresso aqui.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Plan Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Plano de Estudos</h3>
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hoje</span>
                  <span className="font-medium text-foreground">
                    {userData?.profile?.subjects?.[0] || "Aguardando configuração"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tempo previsto</span>
                  <span className="font-medium text-foreground">
                    {userData?.profile?.weeklyHours || "Não definido"}
                  </span>
                </div>
                <Button className="w-full" variant="secondary" data-testid="button-start-study">
                  Começar Estudo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Desempenho</h3>
                <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-chart-1" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Média de acertos</span>
                  <span className="font-medium text-foreground">-</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questões resolvidas</span>
                  <span className="font-medium text-foreground">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ranking</span>
                  <span className="font-medium text-foreground">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4" 
              onClick={() => setLocation("/simulados")}
              data-testid="button-simulado"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full mb-2 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Simulados</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => setLocation("/questions")}
              data-testid="button-questoes"
            >
              <div className="w-8 h-8 bg-accent/10 rounded-full mb-2 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium">Questões</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col py-4" 
              onClick={() => {
                // TODO: Navigate to statistics page
                console.log('Navigate to statistics');
              }}
              data-testid="button-relatorios"
            >
              <div className="w-8 h-8 bg-chart-2/10 rounded-full mb-2 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-chart-2" />
              </div>
              <span className="text-sm font-medium">Estatísticas</span>
            </Button>

            <Button variant="outline" className="h-auto flex-col py-4" data-testid="button-perfil">
              <div className="w-8 h-8 bg-chart-3/10 rounded-full mb-2 flex items-center justify-center">
                <User className="w-4 h-4 text-chart-3" />
              </div>
              <span className="text-sm font-medium">Perfil</span>
            </Button>
          </div>
        </div>

        {/* Goals Overview */}
        {userData?.profile?.goals && userData.profile.goals.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Seus Objetivos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.profile.goals.map((goal, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground capitalize">{goal}</h4>
                        <p className="text-sm text-muted-foreground">Em progresso</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
