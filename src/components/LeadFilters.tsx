import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Filter } from "lucide-react";

export type SortOption = "score-desc" | "score-asc" | "date-desc" | "date-asc" | "name-asc" | "name-desc";
export type StatusFilter = "all" | "quente" | "morno" | "frio";

interface LeadFiltersProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

export const LeadFilters = ({
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
}: LeadFiltersProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
        <SelectTrigger className="w-[130px] h-9 text-sm bg-background/50 border-border/50">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="quente">🔥 Quente</SelectItem>
          <SelectItem value="morno">🌡️ Morno</SelectItem>
          <SelectItem value="frio">❄️ Frio</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-[140px] h-9 text-sm bg-background/50 border-border/50">
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score-desc">Score ↓</SelectItem>
          <SelectItem value="score-asc">Score ↑</SelectItem>
          <SelectItem value="date-desc">Mais recente</SelectItem>
          <SelectItem value="date-asc">Mais antigo</SelectItem>
          <SelectItem value="name-asc">Nome A-Z</SelectItem>
          <SelectItem value="name-desc">Nome Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
