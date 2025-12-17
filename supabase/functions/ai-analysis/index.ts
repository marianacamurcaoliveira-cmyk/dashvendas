import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { lead, type, message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "analysis") {
      systemPrompt = `Você é um especialista em vendas do setor de LIMPEZA PROFISSIONAL e HIGIENIZAÇÃO.
      
Você conhece profundamente:
- Produtos de limpeza industrial e doméstica
- Equipamentos de higienização (aspiradores, lavadoras, polidoras)
- Produtos químicos (desengordurantes, sanitizantes, desinfetantes)
- Produtos sustentáveis e eco-friendly
- EPIs para profissionais de limpeza
- Tendências do mercado de limpeza

Analise o lead e forneça estratégias de vendas específicas para o setor de limpeza. Use emojis para destacar pontos importantes. Seja prático e objetivo.`;

      userPrompt = `Analise este lead interessado em produtos de limpeza:

Nome: ${lead.name}
Score: ${lead.score}/100
Status: ${lead.status}
Interesse: ${lead.interest}
Histórico: ${lead.history}
Último contato: ${lead.lastContact}

Forneça:
1. 📊 Análise do perfil do cliente e seu potencial de compra
2. 🧹 Produtos de limpeza recomendados baseados no interesse
3. 💡 Script de vendas personalizado para o setor de limpeza
4. 🎯 Gatilhos mentais específicos (higiene, economia, sustentabilidade)
5. ⚠️ Objeções comuns no setor e como contorná-las
6. 📈 Estimativa de chance de conversão

Inclua sugestões de produtos relacionados e upselling.`;
    } else if (type === "chat") {
      systemPrompt = `Você é um vendedor consultivo especialista no setor de LIMPEZA PROFISSIONAL.

Você conhece todos os produtos de limpeza: detergentes, desinfetantes, sanitizantes, equipamentos, EPIs, produtos eco-friendly, etc.

Regras:
- Responda de forma natural e amigável em português brasileiro
- Máximo 3 frases por resposta
- Foque em entender as necessidades e oferecer soluções
- Use técnicas de vendas consultivas
- Mencione benefícios específicos dos produtos de limpeza
- Conduza para o fechamento quando apropriado`;

      userPrompt = `Contexto do Lead:
- Nome: ${lead.name}
- Interesse: ${lead.interest}
- Score: ${lead.score}/100
- Status: ${lead.status}

Última mensagem do lead: "${message}"

Responda de forma natural, persuasiva e personalizada para o setor de limpeza.`;
    } else if (type === "suggest") {
      systemPrompt = `Você é um vendedor consultivo especialista no setor de LIMPEZA. Sugira uma resposta profissional para continuar a conversa de vendas.`;
      
      userPrompt = `Lead: ${lead.name}
Interesse: ${lead.interest}
Última mensagem: "${message}"

Sugira uma resposta curta (máximo 2 frases) para avançar a negociação.`;
    }

    console.log("Calling Lovable AI with type:", type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar solicitação" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Não foi possível gerar uma resposta.";

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-analysis function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
