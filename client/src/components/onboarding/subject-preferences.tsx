import { cn } from "@/lib/utils";

interface SubjectPreferencesProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const subjects = [
  { id: "direito-constitucional", label: "Direito Constitucional" },
  { id: "direito-penal", label: "Direito Penal" },
  { id: "direito-administrativo", label: "Direito Administrativo" },
  { id: "portugues", label: "Português" },
  { id: "matematica", label: "Matemática" },
  { id: "legislacao", label: "Legislação" },
  { id: "direitos-humanos", label: "Direitos Humanos" },
  { id: "criminologia", label: "Criminologia" },
];

export function SubjectPreferences({ value, onChange }: SubjectPreferencesProps) {
  const handleToggle = (subjectId: string) => {
    if (value.includes(subjectId)) {
      onChange(value.filter(id => id !== subjectId));
    } else {
      onChange([...value, subjectId]);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">Quais matérias você quer focar?</h3>
        <p className="text-muted-foreground">Selecione as disciplinas para seu plano de estudos</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <label key={subject.id} className="cursor-pointer">
            <input
              type="checkbox"
              name="subjects"
              value={subject.id}
              checked={value.includes(subject.id)}
              onChange={() => handleToggle(subject.id)}
              className="sr-only peer"
              data-testid={`checkbox-subject-${subject.id}`}
            />
            <div className={cn(
              "p-4 text-center border rounded-lg transition-colors",
              "peer-checked:border-primary peer-checked:bg-primary/5",
              "hover:bg-accent",
              value.includes(subject.id) ? "border-primary bg-primary/5" : "border-border"
            )}>
              <span className="text-sm font-medium text-foreground">{subject.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
