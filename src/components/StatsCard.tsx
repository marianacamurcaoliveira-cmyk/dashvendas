import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", delay = 0 }: StatsCardProps) {
  return (
    <div 
      className="glass-card rounded-xl p-5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl bg-secondary/50", iconColor)}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
