import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Users, Zap, TrendingUp, Star, Target, Sparkles, BarChart3, LogOut, Loader2, UserCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { LeadCard, Lead } from "@/components/LeadCard";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { ChatInterface } from "@/components/ChatInterface";
import { LeadForm } from "@/components/LeadForm";
import { DashboardCharts } from "@/components/DashboardCharts";
import { LeadProspector } from "@/components/LeadProspector";
import { LeadFilters, SortOption, StatusFilter } from "@/components/LeadFilters";
import { aiService } from "@/lib/aiService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const initialLeads: Lead[] = [
  {
    id: 1,
    name: "João Silva",
    phone: "85 99999-1234",
    score: 85,
    status: "quente",
    lastContact: "2 horas atrás",
    interest: "Kit Limpeza Profissional",
    history: "Perguntou sobre produtos para limpeza pesada e desengordurantes",
  },
  {
    id: 2,
    name: "Maria Santos",
    phone: "85 98888-5678",
    score: 65,
    status: "morno",
    lastContact: "1 dia atrás",
    interest: "Produtos Eco-Friendly",
    history: "Busca produtos sustentáveis para sua empresa de limpeza",
  },
  {
    id: 3,
    name: "Pedro Costa",
    phone: "85 97777-9012",
    score: 95,
    status: "quente",
    lastContact: "30 min atrás",
    interest: "Equipamentos de Higienização",
    history: "Muito interessado em lavadoras e aspiradores industriais",
  },
  {
    id: 4,
    name: "Ana Oliveira",
    phone: "85 96666-3456",
    score: 45,
    status: "frio",
    lastContact: "3 dias atrás",
    interest: "Desinfetantes Hospitalar",
    history: "Viu catálogo mas não respondeu sobre quantidades",
  },
];

interface ChatMessage {
  from: "lead" | "you";
  text: string;
  time: string;
  isAI?: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "score-desc":
          return b.score - a.score;
        case "score-asc":
          return a.score - b.score;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-desc":
        case "date-asc":
          // Parse lastContact for sorting (simplified)
          const parseTime = (str: string) => {
            if (str.includes("min")) return parseInt(str) || 0;
            if (str.includes("hora")) return (parseInt(str) || 1) * 60;
            if (str.includes("dia")) return (parseInt(str) || 1) * 1440;
            return 9999;
          };
          const timeA = parseTime(a.lastContact);
          const timeB = parseTime(b.lastContact);
          return sortBy === "date-desc" ? timeA - timeB : timeB - timeA;
        default:
          return 0;
      }
    });

    return result;
  }, [leads, sortBy, statusFilter]);

  const handleAddLead = useCallback(
    (newLead: Omit<Lead, "id">) => {
      const id = Math.max(...leads.map((l) => l.id), 0) + 1;
      setLeads((prev) => [{ ...newLead, id }, ...prev]);
    },
    [leads]
  );

  const stats = {
    totalLeads: leads.length,
    hotLeads: leads.filter((l) => l.status === "quente").length,
    conversionRate: "32%",
    avgScore: Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length),
  };

  const generateAISuggestion = useCallback(async (lead: Lead) => {
    setIsAiThinking(true);
    setAiSuggestion("");

    const response = await aiService.getLeadAnalysis(lead);
    
    if (response.error) {
      toast({
        title: "Erro na análise",
        description: response.error,
        variant: "destructive",
      });
      setAiSuggestion("Não foi possível gerar a análise. Tente novamente.");
    } else {
      setAiSuggestion(response.content);
    }
    
    setIsAiThinking(false);
  }, []);

  const handleLeadSelect = useCallback(
    (lead: Lead) => {
      setSelectedLead(lead);
      generateAISuggestion(lead);
      setChatMessages([
        { from: "lead", text: `Olá, tenho interesse em ${lead.interest}. Podem me ajudar?`, time: "10:30" },
        { from: "you", text: "Olá! Claro, temos ótimas opções para você. Qual é a sua necessidade principal?", time: "10:32" },
      ]);
    },
    [generateAISuggestion]
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      const userMessage: ChatMessage = {
        from: "you",
        text: message,
        time: new Date().toLocaleTimeString().slice(0, 5),
      };
      setChatMessages((prev) => [...prev, userMessage]);

      if (autoResponseEnabled && selectedLead) {
        setIsAiThinking(true);

        const response = await aiService.getChatResponse(selectedLead, message);

        if (response.error) {
          toast({
            title: "Erro",
            description: response.error,
            variant: "destructive",
          });
          setIsAiThinking(false);
          return;
        }

        setChatMessages((prev) => [
          ...prev,
          {
            from: "lead",
            text: response.content,
            time: new Date().toLocaleTimeString().slice(0, 5),
            isAI: true,
          },
        ]);
        setIsAiThinking(false);
      }
    },
    [autoResponseEnabled, selectedLead]
  );

  const handleSuggestResponse = useCallback(async () => {
    if (!selectedLead || chatMessages.length === 0) return;
    
    setIsAiThinking(true);
    const lastLeadMessage = [...chatMessages].reverse().find((msg) => msg.from === "lead")?.text || "";

    const response = await aiService.getSuggestedResponse(selectedLead, lastLeadMessage);

    if (response.content) {
      return response.content;
    }
    
    setIsAiThinking(false);
    return "";
  }, [selectedLead, chatMessages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg animate-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Vital <span className="text-gradient">Sales Pro</span>
                </h1>
                <p className="text-muted-foreground">Sistema de Vendas com IA para Produtos de Limpeza</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LeadForm onAddLead={handleAddLead} />

              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className={`flex items-center gap-2 glass-card rounded-xl px-4 py-3 transition-all hover:scale-105 ${
                  showDashboard ? "ring-2 ring-primary" : ""
                }`}
              >
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Dashboard</span>
              </button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="glass-card rounded-xl h-12 w-12"
                title="Perfil"
              >
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="glass-card rounded-xl h-12 w-12"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </Button>

              <div className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
                <Bot className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Auto-resposta IA</span>
                <Switch
                  checked={autoResponseEnabled}
                  onCheckedChange={setAutoResponseEnabled}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total de Leads"
            value={stats.totalLeads}
            icon={Users}
            iconColor="text-primary"
            delay={0}
          />
          <StatsCard
            title="Leads Quentes"
            value={stats.hotLeads}
            icon={Zap}
            iconColor="text-destructive"
            delay={100}
          />
          <StatsCard
            title="Taxa Conversão"
            value={stats.conversionRate}
            icon={TrendingUp}
            iconColor="text-success"
            delay={200}
          />
          <StatsCard
            title="Score Médio"
            value={stats.avgScore}
            icon={Star}
            iconColor="text-warning"
            delay={300}
          />
        </section>

        {/* Dashboard Charts */}
        {showDashboard && <DashboardCharts />}

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads List */}
          <section className="lg:col-span-1 space-y-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <LeadProspector onAddLead={handleAddLead} />
            
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Leads Ativos
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filteredAndSortedLeads.length})
                  </span>
                </h2>
              </div>
              <LeadFilters
                sortBy={sortBy}
                onSortChange={setSortBy}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredAndSortedLeads.length > 0 ? (
                  filteredAndSortedLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLead?.id === lead.id}
                      onClick={() => handleLeadSelect(lead)}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum lead encontrado
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* AI & Chat */}
          <section className="lg:col-span-2 space-y-6">
            {selectedLead ? (
              <>
                <AIAnalysisPanel
                  lead={selectedLead}
                  suggestion={aiSuggestion}
                  isThinking={isAiThinking && !chatMessages.length}
                />
                <ChatInterface
                  lead={selectedLead}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  onSuggestResponse={handleSuggestResponse}
                  isThinking={isAiThinking}
                  autoResponseEnabled={autoResponseEnabled}
                />
              </>
            ) : (
              <div className="glass-card rounded-xl p-12 text-center animate-fade-in" style={{ animationDelay: "500ms" }}>
                <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-5 animate-float">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Selecione um Lead</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Clique em um lead para ver análises inteligentes e recomendações de produtos de limpeza personalizadas
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
