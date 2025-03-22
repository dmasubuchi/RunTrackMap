import { cn } from "@/lib/utils";

interface ActivityBadgeProps {
  type: "running" | "walking";
  className?: string;
}

export function ActivityBadge({ type, className }: ActivityBadgeProps) {
  return (
    <div
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        type === "running" 
          ? "bg-blue-100 text-blue-700" 
          : "bg-green-100 text-green-700",
        className
      )}
    >
      {type === "running" ? "Running" : "Walking"}
    </div>
  );
}
