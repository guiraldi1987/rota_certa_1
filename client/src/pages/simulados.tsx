import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  Clock, 
  Play, 
  Plus, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  Trophy,
  Calendar,
  BookOpen
} from "lucide-react";

interface Simulado {
  id: string;
  title: string;
  type: "diagnostic" | "practice" | "mock_exam";
  subjects: string[];
  totalQuestions: number;
  timeLimit?: number;
  difficulty: "adaptive" | "easy" | "medium" | "hard";
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  score?: string;
  correctAnswers: number;
  timeSpent?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export default function Simulados() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    subjects: [] as string[],
    totalQuestions: 20,
    timeLimit: 40,
    difficulty: "adaptive" as "adaptive" | "easy" | "medium" | "hard",
  });

  const { data: simulados, isLoading } = useQuery<Simulado[]>({
    queryKey: ["/api/simulados"],
  });

  const createSimuladoMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/simulados/generate", data);
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulados"] });
      toast({
        title: "Simulado criado",
        description: "Seu simulado inteligente foi gerado com sucesso!",
      });
      setShowCreateForm(false);
      // For now, just stay on the simulados page until we implement execution
      console.log("Simulado criado:", result);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o simulado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const subjects = [
    "Direito Constitucional",
    "Direito Penal", 
    "Direito Administrativo",
    "Português",
    "Matemática",
    "Legislação",
    "Direitos Humanos",
    "Criminologia"
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "diagnostic": return "Diagnóstico";
      case "practice": return "Treino";
      case "mock_exam": return "Simulado Oficial";
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return "Não iniciado";
      case "in_progress": return "Em andamento";
      case "completed": return "Concluído";
      case "abandoned": return "Abandonado";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "abandoned": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "adaptive": return "Adaptativo";
      case "easy": return "Fácil";
      case "medium": return "Médio";
      case "hard": return "Difícil";
      default: return difficulty;
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setCreateFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleCreateSimulado = () => {
    if (createFormData.subjects.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma disciplina.",
        variant: "destructive",
      });
      return;
    }

    createSimuladoMutation.mutate(createFormData);
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 py-6 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCreateForm(false)}
                  data-testid="button-back-simulados"
                >
                  ← Voltar
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Criar Simulado Inteligente</h1>
                  <p className="text-sm text-muted-foreground">Configure suas preferências de estudo</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Simulado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Título (opcional)</label>
                <Input
                  placeholder="Ex: Simulado de Direito Constitucional"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  data-testid="input-simulado-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Disciplinas *</label>
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map((subject) => (
                    <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={createFormData.subjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                        data-testid={`checkbox-subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Questões</label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={createFormData.totalQuestions}
                    onChange={(e) => setCreateFormData({ ...createFormData, totalQuestions: parseInt(e.target.value) || 20 })}
                    data-testid="input-total-questions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tempo Limite (min)</label>
                  <Input
                    type="number"
                    min="10"
                    max="180"
                    value={createFormData.timeLimit}
                    onChange={(e) => setCreateFormData({ ...createFormData, timeLimit: parseInt(e.target.value) || 40 })}
                    data-testid="input-time-limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dificuldade</label>
                  <Select 
                    value={createFormData.difficulty} 
                    onValueChange={(value: any) => setCreateFormData({ ...createFormData, difficulty: value })}
                  >
                    <SelectTrigger data-testid="select-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adaptive">Adaptativo (Recomendado)</SelectItem>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">ℹ️ Sobre o Modo Adaptativo</h4>
                <p className="text-sm text-muted-foreground">
                  O algoritmo inteligente seleciona questões baseado no seu histórico de desempenho. 
                  Disciplinas com menor taxa de acerto recebem questões mais fáceis, 
                  enquanto áreas de domínio recebem questões mais desafiadoras.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateSimulado}
                  disabled={createSimuladoMutation.isPending || createFormData.subjects.length === 0}
                  className="flex-1"
                  data-testid="button-create-simulado"
                >
                  {createSimuladoMutation.isPending ? "Gerando..." : "Criar Simulado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Simulados</h1>
                <p className="text-muted-foreground">
                  Treine com simulados inteligentes e acompanhe seu progresso
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)} data-testid="button-new-simulado">
              <Plus className="w-4 h-4 mr-2" />
              Novo Simulado
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowCreateForm(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Simulado Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Gerado automaticamente com base no seu desempenho
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Diagnóstico</h3>
              <p className="text-sm text-muted-foreground">
                Avalie seu nível atual em todas as disciplinas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-chart-1/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="font-semibold mb-2">Simulado Oficial</h3>
              <p className="text-sm text-muted-foreground">
                Pratique com formato real de prova
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Simulados */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Seus Simulados</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : simulados?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum simulado ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro simulado inteligente para praticar.
                </p>
                <Button onClick={() => setShowCreateForm(true)} data-testid="button-first-simulado">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Simulado
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {simulados?.map((simulado) => (
                <Card key={simulado.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-foreground mb-2">{simulado.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(simulado.createdAt).toLocaleDateString('pt-BR')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{simulado.totalQuestions} questões</span>
                          </span>
                          {simulado.timeLimit && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{simulado.timeLimit} min</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{getTypeLabel(simulado.type)}</Badge>
                        <Badge className={getStatusColor(simulado.status)}>
                          {getStatusLabel(simulado.status)}
                        </Badge>
                        <Badge variant="secondary">{getDifficultyLabel(simulado.difficulty)}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disciplinas:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {simulado.subjects.map((subject) => (
                            <Badge key={subject} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {simulado.status === "completed" && simulado.score && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Desempenho:</span>
                            <span>{parseFloat(simulado.score).toFixed(1)}%</span>
                          </div>
                          <Progress value={parseFloat(simulado.score)} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{simulado.correctAnswers}/{simulado.totalQuestions} acertos</span>
                            {simulado.timeSpent && (
                              <span>Tempo: {formatTime(simulado.timeSpent)}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {simulado.status === "in_progress" && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso:</span>
                            <span>{simulado.correctAnswers}/{simulado.totalQuestions}</span>
                          </div>
                          <Progress value={(simulado.correctAnswers / simulado.totalQuestions) * 100} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div></div>
                      <div className="space-x-2">
                        {simulado.status === "completed" && (
                          <Button variant="outline" size="sm" data-testid={`button-review-${simulado.id}`}>
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Ver Resultados
                          </Button>
                        )}
                        {(simulado.status === "not_started" || simulado.status === "in_progress") && (
                          <Button size="sm" data-testid={`button-continue-${simulado.id}`}>
                            <Play className="w-4 h-4 mr-1" />
                            {simulado.status === "not_started" ? "Iniciar" : "Continuar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}