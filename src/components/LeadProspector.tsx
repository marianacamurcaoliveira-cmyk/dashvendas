import { useState } from 'react';
import { z } from 'zod';
import { Search, MapPin, Building2, Plus, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { firecrawlApi, ProspectedLead } from '@/lib/api/firecrawl';

const prospectorSchema = z.object({
  city: z.string()
    .trim()
    .min(2, "Cidade deve ter no mínimo 2 caracteres")
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s,'-]+$/, "Cidade deve conter apenas letras e vírgulas"),
  businessType: z.string()
    .trim()
    .min(3, "Tipo de negócio deve ter no mínimo 3 caracteres")
    .max(100, "Tipo de negócio deve ter no máximo 100 caracteres"),
});

interface LeadProspectorProps {
  onAddLead: (lead: { name: string; phone: string; status: string; score: number; interest: string; notes?: string }) => void;
}

export function LeadProspector({ onAddLead }: LeadProspectorProps) {
  const { toast } = useToast();
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState('lojas de produtos de limpeza');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [leads, setLeads] = useState<ProspectedLead[]>([]);
  const [addedLeads, setAddedLeads] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    // Validate inputs
    const result = prospectorSchema.safeParse({ city, businessType });
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Dados inválidos";
      toast({
        title: 'Dados inválidos',
        description: errorMessage,
        variant: 'destructive',
      });
      return;
    }

    const validatedCity = result.data.city;
    const validatedBusinessType = result.data.businessType;

    setIsSearching(true);
    setLeads([]);

    try {
      const query = `${validatedBusinessType} em ${validatedCity} telefone contato`;
      
      toast({
        title: 'Buscando...',
        description: `Procurando ${validatedBusinessType} em ${validatedCity}`,
      });

      const searchResponse = await firecrawlApi.search(query, { limit: 15 });

      if (!searchResponse.success) {
        throw new Error(searchResponse.error || 'Erro na busca');
      }

      const results = searchResponse.data || [];
      
      if (results.length === 0) {
        toast({
          title: 'Nenhum resultado',
          description: 'Não foram encontrados resultados para essa busca.',
        });
        setIsSearching(false);
        return;
      }

      setIsProcessing(true);
      toast({
        title: 'Processando com IA',
        description: `Analisando ${results.length} resultados...`,
      });

      const prospectResponse = await firecrawlApi.prospectLeads(results);

      if (!prospectResponse.success) {
        throw new Error(prospectResponse.error || 'Erro ao processar leads');
      }

      setLeads(prospectResponse.leads || []);
      
      toast({
        title: 'Busca concluída!',
        description: `Encontrados ${prospectResponse.leads?.length || 0} potenciais leads.`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Erro na busca',
        description: error instanceof Error ? error.message : 'Erro ao buscar leads',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
      setIsProcessing(false);
    }
  };

  const handleAddLead = (lead: ProspectedLead) => {
    const status = lead.score >= 70 ? 'quente' : lead.score >= 40 ? 'morno' : 'frio';
    
    onAddLead({
      name: lead.name,
      phone: lead.phone || 'Não informado',
      status,
      score: lead.score,
      interest: lead.businessType,
      notes: `${lead.notes}${lead.address ? ` | Endereço: ${lead.address}` : ''}${lead.website ? ` | Site: ${lead.website}` : ''}`,
    });

    setAddedLeads(prev => new Set([...prev, lead.name]));

    toast({
      title: 'Lead adicionado!',
      description: `${lead.name} foi adicionado à sua lista.`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 40) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Prospecção Automatizada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cidade (ex: São Paulo, SP)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tipo de negócio"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || isProcessing}
            className="w-full"
          >
            {isSearching || isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isProcessing ? 'Processando com IA...' : 'Buscando...'}
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar Leads
              </>
            )}
          </Button>
        </div>

        {leads.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              {leads.length} leads encontrados
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {leads.map((lead, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{lead.name}</h5>
                      <p className="text-xs text-muted-foreground">{lead.businessType}</p>
                    </div>
                    <Badge className={`${getScoreColor(lead.score)} text-xs`}>
                      {lead.score}%
                    </Badge>
                  </div>
                  
                  {lead.phone && (
                    <p className="text-xs text-muted-foreground">📞 {lead.phone}</p>
                  )}
                  {lead.address && (
                    <p className="text-xs text-muted-foreground">📍 {lead.address}</p>
                  )}
                  {lead.notes && (
                    <p className="text-xs text-muted-foreground italic">{lead.notes}</p>
                  )}

                  <Button
                    size="sm"
                    variant={addedLeads.has(lead.name) ? 'secondary' : 'default'}
                    onClick={() => handleAddLead(lead)}
                    disabled={addedLeads.has(lead.name)}
                    className="w-full mt-2"
                  >
                    {addedLeads.has(lead.name) ? (
                      'Adicionado ✓'
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar Lead
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
