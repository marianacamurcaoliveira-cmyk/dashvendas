import { Phone, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lead } from "./LeadCard";

interface AIAnalysisPanelProps {
  lead: Lead;
  suggestion: string;
  isThinking: boolean;
}

export function AIAnalysisPanel({ lead, suggestion, isThinking }: AIAnalysisPanelProps) {
  return (
    <div className="glass-card rounded-xl p-6 animate-slide-in-right">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Análise Inteligente IA
      </h2>

      {isThinking ? (
        <div className="bg-background/50 rounded-xl p-8 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analisando o perfil do lead...</p>
        </div>
      ) : (
        <div className="bg-background/50 rounded-xl p-4 max-h-64 overflow-y-auto">
          <pre className="text-secondary-foreground text-sm whitespace-pre-wrap font-sans leading-relaxed">
            {suggestion || "Aguardando análise..."}
          </pre>
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <Button className="flex-1 gradient-success text-success-foreground border-0 hover:opacity-90">
          <Phone className="w-4 h-4 mr-2" />
          Ligar Agora
        </Button>
        <Button className="flex-1 gradient-action text-primary-foreground border-0 hover:opacity-90">
          <MessageSquare className="w-4 h-4 mr-2" />
          Enviar WhatsApp
        </Button>
      </div>
    </div>
  );
}
