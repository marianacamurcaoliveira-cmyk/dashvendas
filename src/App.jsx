import React, { useState } from 'react';
import { MessageSquare, Users, TrendingUp, Zap, Send, Phone, Star, Clock, Brain, Target, Sparkles, Bot, UserPlus, X } from 'lucide-react';

const AISalesAgent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([
    { id: 1, name: 'João Silva', phone: '85 99999-1234', score: 85, status: 'quente', lastContact: '2 horas atrás', interest: 'Produto Premium', history: 'Perguntou sobre preços e formas de pagamento' },
    { id: 2, name: 'Maria Santos', phone: '85 98888-5678', score: 65, status: 'morno', lastContact: '1 dia atrás', interest: 'Produto Básico', history: 'Demonstrou interesse mas ainda tem dúvidas' },
    { id: 3, name: 'Pedro Costa', phone: '85 97777-9012', score: 95, status: 'quente', lastContact: '30 min atrás', interest: 'Produto Premium + Serviços', history: 'Muito interessado, pediu proposta' },
    { id: 4, name: 'Ana Oliveira', phone: '85 96666-3456', score: 45, status: 'frio', lastContact: '3 dias atrás', interest: 'Produto Básico', history: 'Viu informações mas não respondeu' },
  ]);
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    score: 50,
    status: 'frio',
    interest: '',
    history: ''
  });

  const stats = {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.status === 'quente').length,
    conversionRate: '32%',
    avgScore: Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)
  };

  const callClaudeAPI = async (prompt, systemPrompt) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            { role: "user", content: prompt }
          ],
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error("Erro ao chamar Claude API:", error);
      return "Desculpe, houve um erro ao processar sua solicitação.";
    }
  };

  const generateAISuggestion = async (lead) => {
    if (!lead) return;
    
    setIsAiThinking(true);
    
    const prompt = `Analise este lead de vendas e forneça uma estratégia completa:

Lead: ${lead.name}
Score: ${lead.score}/100
Status: ${lead.status}
Interesse: ${lead.interest}
Histórico: ${lead.history}
Último contato: ${lead.lastContact}

Forneça:
1. Análise do perfil e momento ideal de abordagem
2. Script de vendas personalizado
3. Gatilhos mentais específicos para este perfil
4. Objeções prováveis e como contorná-las
5. Estimativa de chance de conversão

Use emojis e seja objetivo.`;

    const systemPrompt = "Você é um especialista em vendas e conversão de leads. Analise o perfil do cliente e forneça estratégias práticas e scripts eficazes. Seja direto, use emojis e foque em resultados.";

    const suggestion = await callClaudeAPI(prompt, systemPrompt);
    setAiSuggestion(suggestion);
    setIsAiThinking(false);
  };

  const generateAIResponse = async (leadMessage, lead) => {
    const conversationHistory = chatMessages
      .map(msg => `${msg.from === 'lead' ? lead.name : 'Você'}: ${msg.text}`)
      .join('\n');

    const prompt = `Você é um vendedor expert conversando com ${lead.name}.

Contexto do Lead:
- Interesse: ${lead.interest}
- Score: ${lead.score}/100
- Status: ${lead.status}
- Histórico: ${lead.history}

Conversa anterior:
${conversationHistory}

Última mensagem do lead: "${leadMessage}"

Responda de forma natural, persuasiva e personalizada. Use técnicas de vendas consultivas. Seja empático mas objetivo. Máximo 3 frases.`;

    const systemPrompt = "Você é um vendedor consultivo expert. Sempre foque em entender as necessidades do cliente, construir rapport e conduzir para o fechamento. Use linguagem natural e amigável do português brasileiro.";

    return await callClaudeAPI(prompt, systemPrompt);
  };

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    generateAISuggestion(lead);
    setChatMessages([
      { from: 'lead', text: `Olá, tenho interesse no ${lead.interest}`, time: '10:30' },
      { from: 'you', text: 'Ótimo! Vou te passar mais informações...', time: '10:32' }
    ]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = { from: 'you', text: newMessage, time: new Date().toLocaleTimeString().slice(0,5) };
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    if (autoResponseEnabled && selectedLead) {
      setIsAiThinking(true);
      
      setTimeout(async () => {
        const leadResponse = await generateAIResponse(newMessage, selectedLead);
        setChatMessages(prev => [...prev, { 
          from: 'lead', 
          text: leadResponse, 
          time: new Date().toLocaleTimeString().slice(0,5),
          isAI: true
        }]);
        setIsAiThinking(false);
      }, 1500);
    }
  };

  const getSuggestedResponse = async () => {
    if (!selectedLead || chatMessages.length === 0) return;
    
    setIsAiThinking(true);
    const lastLeadMessage = [...chatMessages].reverse().find(msg => msg.from === 'lead')?.text;
    
    if (lastLeadMessage) {
      const suggestion = await generateAIResponse(lastLeadMessage, selectedLead);
      setNewMessage(suggestion);
    }
    setIsAiThinking(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status) => {
    if (status === 'quente') return 'bg-red-500';
    if (status === 'morno') return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone || !newLead.interest) {
      alert('Preencha pelo menos nome, telefone e interesse!');
      return;
    }

    const leadToAdd = {
      id: leads.length + 1,
      name: newLead.name,
      phone: newLead.phone,
      score: parseInt(newLead.score),
      status: newLead.status,
      interest: newLead.interest,
      history: newLead.history || 'Lead recém adicionado',
      lastContact: 'Agora mesmo'
    };

    setLeads([...leads, leadToAdd]);
    setNewLead({
      name: '',
      phone: '',
      score: 50,
      status: 'frio',
      interest: '',
      history: ''
    });
    setShowAddLeadForm(false);
    alert('✅ Lead adicionado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Agente de Vendas IA</h1>
                <p className="text-purple-200">Sistema Inteligente com Claude AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
              <Bot className="w-5 h-5 text-purple-300" />
              <span className="text-white text-sm">Resposta Automática IA</span>
              <button
                onClick={() => setAutoResponseEnabled(!autoResponseEnabled)}
                className={`w-12 h-6 rounded-full transition-all ${
                  autoResponseEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                  autoResponseEnabled ? 'ml-6' : 'ml-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total de Leads</p>
                  <p className="text-3xl font-bold text-white">{stats.totalLeads}</p>
                </div>
                <Users className="w-10 h-10 text-purple-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Leads Quentes</p>
                  <p className="text-3xl font-bold text-white">{stats.hotLeads}</p>
                </div>
                <Zap className="w-10 h-10 text-red-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Taxa Conversão</p>
                  <p className="text-3xl font-bold text-white">{stats.conversionRate}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Score Médio</p>
                  <p className="text-3xl font-bold text-white">{stats.avgScore}</p>
                </div>
                <Star className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Leads Ativos
              </h2>
              <button
                onClick={() => setShowAddLeadForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                title="Adicionar Novo Lead"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {leads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => handleLeadSelect(lead)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedLead?.id === lead.id
                      ? 'bg-purple-500/30 border-2 border-purple-400'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{lead.name}</h3>
                      <p className="text-sm text-purple-200">{lead.phone}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getScoreColor(lead.score)}`}>
                      Score: {lead.score}
                    </span>
                  </div>
                  
                  <p className="text-xs text-purple-300 mb-1">{lead.interest}</p>
                  <p className="text-xs text-purple-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lead.lastContact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedLead ? (
              <>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Análise Inteligente Claude AI
                  </h2>
                  
                  {isAiThinking && !chatMessages.length ? (
                    <div className="bg-black/30 rounded-lg p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-purple-300">Claude está analisando o lead...</p>
                    </div>
                  ) : (
                    <div className="bg-black/30 rounded-lg p-4">
                      <pre className="text-purple-100 text-sm whitespace-pre-wrap font-sans">
                        {aiSuggestion || 'Aguardando análise...'}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Ligar Agora
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Enviar WhatsApp
                    </button>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 flex flex-col h-96">
                  <div className="p-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Conversa com {selectedLead.name}
                      </h2>
                      {autoResponseEnabled && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          IA Ativa
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.from === 'you' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-lg px-4 py-2 ${
                          msg.from === 'you'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-70">{msg.time}</p>
                            {msg.isAI && (
                              <span className="text-xs bg-black/30 px-2 py-0.5 rounded">🤖 IA</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isAiThinking && chatMessages.length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-white/20 text-white rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-white/20">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={getSuggestedResponse}
                        disabled={isAiThinking}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        Sugerir Resposta IA
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isAiThinking}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Selecione um Lead</h3>
                <p className="text-purple-200">Clique em um lead na lista para ver a análise IA do Claude e iniciar a conversa inteligente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Lead */}
      {showAddLeadForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border border-purple-400 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Adicionar Novo Lead
              </h3>
              <button
                onClick={() => setShowAddLeadForm(false)}
                className="text-white hover:text-red-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm font-semibold block mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  placeholder="Ex: João Silva"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm font-semibold block mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  placeholder="Ex: 85 99999-1234"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm font-semibold block mb-2">
                  Interesse *
                </label>
                <input
                  type="text"
                  value={newLead.interest}
                  onChange={(e) => setNewLead({...newLead, interest: e.target.value})}
                  placeholder="Ex: Produto Premium"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm font-semibold block mb-2">
                  Score: {newLead.score}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newLead.score}
                  onChange={(e) => setNewLead({...newLead, score: e.target.value})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-purple-300 mt-1">
                  <span>Frio (0)</span>
                  <span>Morno (50)</span>
                  <span>Quente (100)</span>
                </div>
              </div>

              <div>
                <label className="text-purple-200 text-sm font-semibold block mb-2">
                  Status
                </label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead({...newLead, status: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="frio" className="bg-slate-800">❄️ Frio</option>
                  <option value="morno" className="bg-slate-800">🌤️ Morno</option>
                  <option value="quente" className="bg-slate-800">🔥 Quente</option>
                </select>
              </div>

              <div>
                <label className="text-purple-200 text-sm font-semibold block mb-2">
                  Histórico/Observações
                </label>
                <textarea
                  value={newLead.history}
                  onChange={(e) => setNewLead({...newLead, history: e.target.value})}
                  placeholder="Ex: Cliente indicado por..."
                  rows="3"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddLeadForm(false)}
                className="flex-1 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddLead}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Adicionar Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISalesAgent;
