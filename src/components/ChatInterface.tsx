import { useState, useCallback } from "react";
import { Send, Sparkles, MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Lead } from "./LeadCard";

interface ChatMessage {
  from: "lead" | "you";
  text: string;
  time: string;
  isAI?: boolean;
}

interface ChatInterfaceProps {
  lead: Lead;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSuggestResponse: () => Promise<string>;
  isThinking: boolean;
  autoResponseEnabled: boolean;
}

export function ChatInterface({
  lead,
  messages,
  onSendMessage,
  onSuggestResponse,
  isThinking,
  autoResponseEnabled,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleSuggest = useCallback(async () => {
    setIsLoadingSuggestion(true);
    const suggestion = await onSuggestResponse();
    if (suggestion) {
      setNewMessage(suggestion);
    }
    setIsLoadingSuggestion(false);
  }, [onSuggestResponse]);

  return (
    <div className="glass-card rounded-xl border flex flex-col h-96 animate-slide-in-right" style={{ animationDelay: "200ms" }}>
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Conversa com {lead.name}
          </h2>
          {autoResponseEnabled && (
            <span className="text-xs bg-success/20 text-success px-3 py-1 rounded-full flex items-center gap-1">
              <Bot className="w-3 h-3" />
              IA Ativa
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex animate-fade-in",
              msg.from === "you" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div
              className={cn(
                "max-w-[280px] rounded-2xl px-4 py-2.5 shadow-lg",
                msg.from === "you"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className="flex items-center justify-between mt-1.5 gap-2">
                <p className="text-xs opacity-70">{msg.time}</p>
                {msg.isAI && (
                  <span className="text-xs bg-background/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    IA
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-secondary text-foreground rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce-dots" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce-dots" style={{ animationDelay: "0.16s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce-dots" style={{ animationDelay: "0.32s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 space-y-3">
        <Button
          onClick={handleSuggest}
          disabled={isThinking || isLoadingSuggestion}
          variant="outline"
          size="sm"
          className="gradient-warning text-warning-foreground border-0 hover:opacity-90"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          {isLoadingSuggestion ? "Gerando..." : "Sugerir Resposta IA"}
        </Button>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSend}
            disabled={isThinking || !newMessage.trim()}
            className="gradient-primary text-primary-foreground border-0 hover:opacity-90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
