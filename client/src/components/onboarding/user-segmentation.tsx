import { CheckCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSegmentationProps {
  value: "concurseiro" | "militar" | "";
  onChange: (value: "concurseiro" | "militar") => void;
}

export function UserSegmentation({ value, onChange }: UserSegmentationProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">Qual é o seu perfil?</h3>
        <p className="text-muted-foreground">Isso nos ajudará a personalizar sua experiência</p>
      </div>

      <div className="space-y-4">
        {/* Concurseiro Option */}
        <label className="block cursor-pointer">
          <input
            type="radio"
            name="userType"
            value="concurseiro"
            checked={value === "concurseiro"}
            onChange={(e) => onChange(e.target.value as "concurseiro")}
            className="sr-only peer"
            data-testid="radio-concurseiro"
          />
          <div className={cn(
            "p-6 border-2 rounded-lg transition-colors",
            "peer-checked:border-primary peer-checked:bg-primary/5",
            "hover:bg-accent",
            value === "concurseiro" ? "border-primary bg-primary/5" : "border-border"
          )}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">Concurseiro</h4>
                <p className="text-sm text-muted-foreground">Quero ingressar na PMESP</p>
              </div>
            </div>
          </div>
        </label>

        {/* Militar Option */}
        <label className="block cursor-pointer">
          <input
            type="radio"
            name="userType"
            value="militar"
            checked={value === "militar"}
            onChange={(e) => onChange(e.target.value as "militar")}
            className="sr-only peer"
            data-testid="radio-militar"
          />
          <div className={cn(
            "p-6 border-2 rounded-lg transition-colors",
            "peer-checked:border-primary peer-checked:bg-primary/5",
            "hover:bg-accent",
            value === "militar" ? "border-primary bg-primary/5" : "border-border"
          )}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">Militar</h4>
                <p className="text-sm text-muted-foreground">Já sou da PMESP e busco progressão</p>
              </div>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
