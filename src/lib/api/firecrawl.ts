import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
};

export type ProspectedLead = {
  name: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  businessType: string;
  score: number;
  notes: string;
};

export const firecrawlApi = {
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  async prospectLeads(searchResults: any[]): Promise<{ success: boolean; leads?: ProspectedLead[]; error?: string }> {
    const { data, error } = await supabase.functions.invoke('lead-prospector', {
      body: { searchResults },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
