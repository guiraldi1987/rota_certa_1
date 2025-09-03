import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingInputProps {
  type: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function FloatingInput({
  type,
  name,
  label,
  value,
  onChange,
  required = false,
  className,
  "data-testid": testId,
}: FloatingInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;
  const hasValue = value.length > 0;
  const shouldLabelFloat = isFocused || hasValue;

  return (
    <div className={cn("relative", className)}>
      <input
        type={inputType}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-3 pt-6 pb-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
        placeholder=" "
        required={required}
        data-testid={testId}
      />
      <label
        htmlFor={name}
        className={cn(
          "absolute left-3 text-muted-foreground pointer-events-none transition-all duration-200 transform-gpu",
          shouldLabelFloat
            ? "top-2 text-xs scale-75 text-primary"
            : "top-4 text-base"
        )}
      >
        {label}
      </label>
      {type === "password" && (
        <button
          type="button"
          className="absolute right-3 top-4 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword(!showPassword)}
          data-testid={`button-toggle-password-${name}`}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}
