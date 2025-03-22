import { useState } from "react";
import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  icon,
  className,
}: ToggleSwitchProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    onCheckedChange(newValue);
  };

  return (
    <div className={cn("flex justify-between items-center", className)}>
      {(icon || label) && (
        <div className="flex items-center">
          {icon && <span className="w-6 text-center text-muted-foreground mr-2">{icon}</span>}
          {label && <span>{label}</span>}
        </div>
      )}
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={handleToggle}
          disabled={disabled}
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}
