import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "@/components/LeadCard";

interface AIResponse {
  content: string;
  error?: string;
}

export const aiService = {
  async getLeadAnalysis(lead: Lead): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: { lead, type: "analysis" },
      });

      if (error) {
        console.error("Error calling AI analysis:", error);
        return { content: "", error: error.message };
      }

      return { content: data.content };
    } catch (err) {
      console.error("Error in getLeadAnalysis:", err);
      return { content: "", error: "Erro ao gerar análise" };
    }
  },

  async getChatResponse(lead: Lead, message: string): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: { lead, type: "chat", message },
      });

      if (error) {
        console.error("Error calling AI chat:", error);
        return { content: "", error: error.message };
      }

      return { content: data.content };
    } catch (err) {
      console.error("Error in getChatResponse:", err);
      return { content: "", error: "Erro ao gerar resposta" };
    }
  },

  async getSuggestedResponse(lead: Lead, lastMessage: string): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: { lead, type: "suggest", message: lastMessage },
      });

      if (error) {
        console.error("Error calling AI suggest:", error);
        return { content: "", error: error.message };
      }

      return { content: data.content };
    } catch (err) {
      console.error("Error in getSuggestedResponse:", err);
      return { content: "", error: "Erro ao gerar sugestão" };
    }
  },
};
