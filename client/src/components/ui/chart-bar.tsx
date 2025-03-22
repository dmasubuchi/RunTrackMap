import { cn } from "@/lib/utils";

interface ChartBarProps {
  value: number;
  maxValue: number;
  color: string;
  label?: string;
  className?: string;
}

export function ChartBar({
  value,
  maxValue,
  color,
  label,
  className,
}: ChartBarProps) {
  // Calculate bar height as percentage of max value
  // with a minimum height of 4px if value > 0
  const height = maxValue > 0 ? Math.max((value / maxValue) * 100, value > 0 ? 4 : 0) : 0;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="h-28 flex items-end">
        <div 
          className={`w-5 ${color} rounded-t`} 
          style={{ height: `${height}%` }}
        ></div>
      </div>
      {label && <p className="text-xs mt-1">{label}</p>}
    </div>
  );
}
