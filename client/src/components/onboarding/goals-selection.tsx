import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalsSelectionProps {
  value: string[];
  onChange: (value: string[]) => void;
  userType: "concurseiro" | "militar" | "";
}

const concurseiroGoals = [
  { id: "soldado", label: "Soldado PM 2ª Classe" },
  { id: "cabo", label: "Cabo PM" },
  { id: "sargento", label: "Sargento PM" },
  { id: "oficial", label: "Oficial PM" },
];

const militarGoals = [
  { id: "cabo", label: "Promoção para Cabo PM" },
  { id: "sargento", label: "Promoção para Sargento PM" },
  { id: "oficial", label: "Concurso para Oficial PM" },
  { id: "especializacao", label: "Especialização" },
];

export function GoalsSelection({ value, onChange, userType }: GoalsSelectionProps) {
  const goals = userType === "concurseiro" ? concurseiroGoals : militarGoals;

  const handleToggle = (goalId: string) => {
    if (value.includes(goalId)) {
      onChange(value.filter(id => id !== goalId));
    } else {
      onChange([...value, goalId]);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">Quais são seus objetivos?</h3>
        <p className="text-muted-foreground">Selecione suas metas profissionais</p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <label key={goal.id} className="block cursor-pointer">
            <input
              type="checkbox"
              name="goals"
              value={goal.id}
              checked={value.includes(goal.id)}
              onChange={() => handleToggle(goal.id)}
              className="sr-only peer"
              data-testid={`checkbox-goal-${goal.id}`}
            />
            <div className={cn(
              "p-4 border rounded-lg transition-colors",
              "peer-checked:border-primary peer-checked:bg-primary/5",
              "hover:bg-accent",
              value.includes(goal.id) ? "border-primary bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{goal.label}</span>
                <div className={cn(
                  "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                  value.includes(goal.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                )}>
                  {value.includes(goal.id) && <Check className="w-3 h-3" />}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
