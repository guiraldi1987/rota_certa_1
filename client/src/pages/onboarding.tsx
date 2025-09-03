import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { UserSegmentation } from "@/components/onboarding/user-segmentation";
import { GoalsSelection } from "@/components/onboarding/goals-selection";
import { StudyPreferences } from "@/components/onboarding/study-preferences";
import { SubjectPreferences } from "@/components/onboarding/subject-preferences";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface OnboardingData {
  userType: "concurseiro" | "militar" | "";
  goals: string[];
  weeklyHours: string;
  studyTimes: string[];
  subjects: string[];
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const totalSteps = 5;

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: "",
    goals: [],
    weeklyHours: "",
    studyTimes: [],
    subjects: [],
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: Omit<OnboardingData, "userType"> & { userType: "concurseiro" | "militar" }) => {
      await apiRequest("POST", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/user/profile/complete-onboarding", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível completar o onboarding. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateOnboardingData = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return onboardingData.userType !== "";
      case 2:
        return onboardingData.goals.length > 0;
      case 3:
        return onboardingData.weeklyHours !== "" && onboardingData.studyTimes.length > 0;
      case 4:
        return onboardingData.subjects.length > 0;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!canProceedFromStep(currentStep)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      if (onboardingData.userType) {
        await saveProfileMutation.mutateAsync({
          userType: onboardingData.userType,
          goals: onboardingData.goals,
          weeklyHours: onboardingData.weeklyHours,
          studyTimes: onboardingData.studyTimes,
          subjects: onboardingData.subjects,
        });
        await completeOnboardingMutation.mutateAsync();
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserSegmentation
            value={onboardingData.userType}
            onChange={(value) => updateOnboardingData("userType", value)}
          />
        );
      case 2:
        return (
          <GoalsSelection
            value={onboardingData.goals}
            onChange={(value) => updateOnboardingData("goals", value)}
            userType={onboardingData.userType}
          />
        );
      case 3:
        return (
          <StudyPreferences
            weeklyHours={onboardingData.weeklyHours}
            studyTimes={onboardingData.studyTimes}
            onWeeklyHoursChange={(value) => updateOnboardingData("weeklyHours", value)}
            onStudyTimesChange={(value) => updateOnboardingData("studyTimes", value)}
          />
        );
      case 4:
        return (
          <SubjectPreferences
            value={onboardingData.subjects}
            onChange={(value) => updateOnboardingData("subjects", value)}
          />
        );
      case 5:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-accent rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Tudo pronto!</h3>
            <p className="text-muted-foreground mb-8">
              Seu perfil foi configurado com sucesso. Agora você pode começar a estudar com um plano personalizado.
            </p>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-foreground mb-2">Próximos passos:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Acesse seu dashboard personalizado</li>
                <li>• Comece com um simulado diagnóstico</li>
                <li>• Siga seu cronograma automático</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
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
          
          <div>
            <span className="text-sm text-muted-foreground">
              Passo {currentStep} de {totalSteps}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          
          {/* Progress Steps */}
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          {/* Step Content */}
          <div className="min-h-[500px] mt-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={previousStep}
              disabled={currentStep === 1}
              data-testid="button-previous"
            >
              Voltar
            </Button>
            <Button
              onClick={nextStep}
              disabled={saveProfileMutation.isPending || completeOnboardingMutation.isPending}
              data-testid="button-next"
            >
              {currentStep === totalSteps ? "Ir para o Dashboard" : "Próximo"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
