// components/dashboard/MetricCard.tsx

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  percentage: string;
  background: string; // e.g. "bg-green-50"
  iconColor: string; // e.g. "text-green-600"
}

export const MetricCard = ({
  label,
  value,
  icon,
  percentage,
  background,
  iconColor,
}: MetricCardProps) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "rounded-md h-14 w-14 grid place-items-center",
            background
          )}
        >
          <div className={cn("w-5 h-5", iconColor)}>{icon}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <ArrowUpRight className="h-3 w-3 text-green-500" />
            <span className="font-semibold">+{percentage}</span>
            <span className="text-xs">vs last week</span>
          </div>
        </div>
      </div>
    </div>
  );
};
