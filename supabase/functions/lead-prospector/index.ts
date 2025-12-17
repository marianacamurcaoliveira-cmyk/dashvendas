import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { searchResults } = await req.json();

    if (!searchResults || !Array.isArray(searchResults)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Search results are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing', searchResults.length, 'search results with AI');

    const prompt = `Você é um assistente especializado em prospecção de leads para vendas de produtos de limpeza.

Analise os seguintes resultados de busca e extraia informações de potenciais clientes (lojas, distribuidoras, empresas de limpeza):

${JSON.stringify(searchResults, null, 2)}

Para cada potencial lead encontrado, extraia:
1. Nome da empresa/loja
2. Telefone (se disponível)
3. Endereço/Cidade (se disponível)
4. Website (se disponível)
5. Tipo de negócio (loja, distribuidora, empresa de serviços)
6. Score de potencial (1-100) baseado em:
   - Relevância para produtos de limpeza
   - Porte aparente do negócio
   - Informações de contato disponíveis

Retorne APENAS um JSON válido no seguinte formato (sem explicações):
{
  "leads": [
    {
      "name": "Nome da Empresa",
      "phone": "telefone ou null",
      "address": "endereço ou null",
      "website": "url ou null",
      "businessType": "tipo do negócio",
      "score": 75,
      "notes": "observações relevantes"
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response received');

    // Parse JSON from response
    let leads = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        leads = parsed.leads || [];
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    console.log('Extracted', leads.length, 'leads');

    return new Response(
      JSON.stringify({ success: true, leads }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing leads:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process leads';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
