import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Lead {
  id: number;
  name: string;
  phone: string;
  score: number;
  status: "quente" | "morno" | "frio";
  lastContact: string;
  interest: string;
  history: string;
}

interface LeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
}

const getScoreVariant = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "hot";
};

const getStatusVariant = (status: string) => {
  if (status === "quente") return "hot";
  if (status === "morno") return "warm";
  return "cold";
};

const getStatusDot = (status: string) => {
  if (status === "quente") return "bg-destructive";
  if (status === "morno") return "bg-warning";
  return "bg-primary";
};

export function LeadCard({ lead, isSelected, onClick }: LeadCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all duration-300",
        isSelected
          ? "bg-primary/20 border-2 border-primary ring-2 ring-primary/20"
          : "bg-secondary/30 hover:bg-secondary/50 border border-border/50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{lead.name}</h3>
          <p className="text-sm text-muted-foreground">{lead.phone}</p>
        </div>
        <div className={cn("w-3 h-3 rounded-full animate-pulse", getStatusDot(lead.status))} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge 
          variant="score" 
          className={cn(
            "text-xs",
            lead.score >= 80 && "bg-success/20 text-success",
            lead.score >= 60 && lead.score < 80 && "bg-warning/20 text-warning",
            lead.score < 60 && "bg-destructive/20 text-destructive"
          )}
        >
          Score: {lead.score}
        </Badge>
        <Badge variant={getStatusVariant(lead.status)} className="capitalize text-xs">
          {lead.status}
        </Badge>
      </div>

      <p className="text-xs text-secondary-foreground mb-2 line-clamp-1">{lead.interest}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {lead.lastContact}
      </p>
    </div>
  );
}
