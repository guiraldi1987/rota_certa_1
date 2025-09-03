import { cn } from "@/lib/utils";

interface StudyPreferencesProps {
  weeklyHours: string;
  studyTimes: string[];
  onWeeklyHoursChange: (value: string) => void;
  onStudyTimesChange: (value: string[]) => void;
}

const weeklyHourOptions = [
  { id: "5-10", label: "5-10h" },
  { id: "10-20", label: "10-20h" },
  { id: "20-30", label: "20-30h" },
  { id: "30+", label: "30h+" },
];

const studyTimeOptions = [
  { id: "morning", label: "Manhã (06:00 - 12:00)" },
  { id: "afternoon", label: "Tarde (12:00 - 18:00)" },
  { id: "evening", label: "Noite (18:00 - 00:00)" },
];

export function StudyPreferences({
  weeklyHours,
  studyTimes,
  onWeeklyHoursChange,
  onStudyTimesChange,
}: StudyPreferencesProps) {
  const handleStudyTimeToggle = (timeId: string) => {
    if (studyTimes.includes(timeId)) {
      onStudyTimesChange(studyTimes.filter(id => id !== timeId));
    } else {
      onStudyTimesChange([...studyTimes, timeId]);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">Vamos personalizar seus estudos</h3>
        <p className="text-muted-foreground">Informe sua disponibilidade e preferências</p>
      </div>

      <div className="space-y-6">
        {/* Study Time per Week */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Quantas horas você pode estudar por semana?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {weeklyHourOptions.map((option) => (
              <label key={option.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="weeklyHours"
                  value={option.id}
                  checked={weeklyHours === option.id}
                  onChange={(e) => onWeeklyHoursChange(e.target.value)}
                  className="sr-only peer"
                  data-testid={`radio-hours-${option.id}`}
                />
                <div className={cn(
                  "p-3 text-center border rounded-lg transition-colors",
                  "peer-checked:border-primary peer-checked:bg-primary/5",
                  "hover:bg-accent",
                  weeklyHours === option.id ? "border-primary bg-primary/5" : "border-border"
                )}>
                  <span className="font-medium text-foreground">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Study Time */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Quando você prefere estudar?
          </label>
          <div className="space-y-2">
            {studyTimeOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="studyTime"
                  value={option.id}
                  checked={studyTimes.includes(option.id)}
                  onChange={() => handleStudyTimeToggle(option.id)}
                  className="rounded border-border text-primary focus:ring-ring"
                  data-testid={`checkbox-time-${option.id}`}
                />
                <span className="text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
