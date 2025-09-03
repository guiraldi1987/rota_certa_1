import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Filter, Search, Clock, CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: string;
  title: string;
  statement: string;
  alternatives: { id: string; text: string; }[];
  correctAlternative: string;
  explanation?: string;
  subject: string;
  examBoard?: string;
  examYear?: number;
  examType?: string;
  difficulty: "easy" | "medium" | "hard";
  successRate: string;
  totalAttempts: number;
}

export default function Questions() {
  const [filters, setFilters] = useState({
    subject: "",
    examBoard: "",
    examYear: "",
    examType: "",
    difficulty: "",
    search: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", filters],
    enabled: true,
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

  const difficulties = [
    { value: "easy", label: "Fácil", color: "bg-green-500" },
    { value: "medium", label: "Médio", color: "bg-yellow-500" },
    { value: "hard", label: "Difícil", color: "bg-red-500" },
  ];

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setSelectedAnswer("");
    setShowResult(false);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !selectedQuestion) return;
    
    setShowResult(true);
    
    // TODO: Save answer to backend
    // await apiRequest("POST", "/api/answers", {
    //   questionId: selectedQuestion.id,
    //   selectedAlternative: selectedAnswer,
    //   isCorrect: selectedAnswer === selectedQuestion.correctAlternative,
    //   timeSpent: timeSpent
    // });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredQuestions = questions?.filter(question => {
    return (
      (!filters.subject || question.subject === filters.subject) &&
      (!filters.examBoard || question.examBoard === filters.examBoard) &&
      (!filters.examYear || question.examYear?.toString() === filters.examYear) &&
      (!filters.examType || question.examType === filters.examType) &&
      (!filters.difficulty || question.difficulty === filters.difficulty) &&
      (!filters.search || 
        question.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        question.statement.toLowerCase().includes(filters.search.toLowerCase())
      )
    );
  }) || [];

  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 py-6 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedQuestion(null)}
                  data-testid="button-back-questions"
                >
                  ← Voltar
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Questão</h1>
                  <p className="text-sm text-muted-foreground">{selectedQuestion.subject}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                  {selectedQuestion.difficulty === "easy" ? "Fácil" : 
                   selectedQuestion.difficulty === "medium" ? "Médio" : "Difícil"}
                </Badge>
                {selectedQuestion.successRate && (
                  <Badge variant="outline">
                    {parseFloat(selectedQuestion.successRate).toFixed(0)}% acertos
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedQuestion.title}</CardTitle>
              {selectedQuestion.examBoard && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{selectedQuestion.examBoard}</span>
                  {selectedQuestion.examYear && <span>• {selectedQuestion.examYear}</span>}
                  {selectedQuestion.examType && <span>• {selectedQuestion.examType}</span>}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{selectedQuestion.statement}</p>
              </div>

              <div className="space-y-3">
                {selectedQuestion.alternatives.map((alternative) => (
                  <label 
                    key={alternative.id}
                    className={`
                      block p-4 border rounded-lg cursor-pointer transition-colors
                      ${selectedAnswer === alternative.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-accent"
                      }
                      ${showResult && alternative.id === selectedQuestion.correctAlternative
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : ""
                      }
                      ${showResult && selectedAnswer === alternative.id && alternative.id !== selectedQuestion.correctAlternative
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : ""
                      }
                    `}
                    data-testid={`alternative-${alternative.id}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={alternative.id}
                      checked={selectedAnswer === alternative.id}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      disabled={showResult}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">{alternative.id}) {alternative.text}</span>
                      {showResult && alternative.id === selectedQuestion.correctAlternative && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {showResult && selectedAnswer === alternative.id && alternative.id !== selectedQuestion.correctAlternative && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {!showResult ? (
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="w-full"
                  data-testid="button-submit-answer"
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    selectedAnswer === selectedQuestion.correctAlternative 
                      ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                      : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  }`}>
                    <div className="flex items-center space-x-2">
                      {selectedAnswer === selectedQuestion.correctAlternative ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {selectedAnswer === selectedQuestion.correctAlternative ? "Correto!" : "Incorreto"}
                      </span>
                    </div>
                    {selectedAnswer !== selectedQuestion.correctAlternative && (
                      <p className="mt-2 text-sm">
                        A resposta correta é: <strong>{selectedQuestion.correctAlternative}</strong>
                      </p>
                    )}
                  </div>

                  {selectedQuestion.explanation && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Explicação:</h4>
                      <p className="text-sm text-muted-foreground">{selectedQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="flex-1">
                      Voltar às Questões
                    </Button>
                    <Button 
                      onClick={() => {
                        // TODO: Get next question
                        setSelectedQuestion(null);
                      }} 
                      className="flex-1"
                      data-testid="button-next-question"
                    >
                      Próxima Questão
                    </Button>
                  </div>
                </div>
              )}
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
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Banco de Questões</h1>
                <p className="text-muted-foreground">
                  {filteredQuestions.length} questões disponíveis
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar questões..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                      data-testid="input-search-questions"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Disciplina</label>
                  <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder="Todas as disciplinas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as disciplinas</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dificuldade</label>
                  <Select value={filters.difficulty} onValueChange={(value) => setFilters({ ...filters, difficulty: value })}>
                    <SelectTrigger data-testid="select-difficulty">
                      <SelectValue placeholder="Todas as dificuldades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as dificuldades</SelectItem>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma questão encontrada</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou remover alguns critérios de busca.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleQuestionSelect(question)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-foreground mb-2">{question.title}</h3>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-3">
                        <span className="font-medium">{question.subject}</span>
                        {question.examBoard && <span>• {question.examBoard}</span>}
                        {question.examYear && <span>• {question.examYear}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty === "easy" ? "Fácil" : 
                         question.difficulty === "medium" ? "Médio" : "Difícil"}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {question.statement.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {question.successRate && (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{parseFloat(question.successRate).toFixed(0)}% acertos</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{question.totalAttempts} tentativas</span>
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-open-question-${question.id}`}>
                      Resolver →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}