import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, Package, Target, Calendar } from "lucide-react";

const salesData = [
  { month: "Jan", vendas: 45, conversao: 28 },
  { month: "Fev", vendas: 52, conversao: 32 },
  { month: "Mar", vendas: 48, conversao: 25 },
  { month: "Abr", vendas: 70, conversao: 38 },
  { month: "Mai", vendas: 85, conversao: 42 },
  { month: "Jun", vendas: 78, conversao: 35 },
];

const topProducts = [
  { name: "Desengordurante Pro", vendas: 245, cor: "hsl(280, 80%, 60%)" },
  { name: "Kit Limpeza Industrial", vendas: 189, cor: "hsl(330, 80%, 60%)" },
  { name: "Detergente Neutro 5L", vendas: 156, cor: "hsl(142, 70%, 45%)" },
  { name: "Limpador Multiuso", vendas: 134, cor: "hsl(210, 80%, 55%)" },
  { name: "Álcool 70% 1L", vendas: 98, cor: "hsl(45, 100%, 50%)" },
];

const conversionByPeriod = [
  { periodo: "Sem 1", taxa: 24 },
  { periodo: "Sem 2", taxa: 32 },
  { periodo: "Sem 3", taxa: 28 },
  { periodo: "Sem 4", taxa: 38 },
];

const pieData = [
  { name: "Leads Quentes", value: 35, color: "hsl(0, 84%, 60%)" },
  { name: "Leads Mornos", value: 45, color: "hsl(45, 100%, 50%)" },
  { name: "Leads Frios", value: 20, color: "hsl(210, 80%, 55%)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-border">
        <p className="text-foreground font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardCharts = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{ animationDelay: "350ms" }}>
      {/* Performance Chart */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Desempenho de Vendas</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 30%, 20%)" />
              <XAxis dataKey="month" stroke="hsl(270, 30%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(270, 30%, 65%)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="hsl(280, 80%, 60%)"
                strokeWidth={2}
                fill="url(#colorVendas)"
                name="Vendas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold text-foreground">Produtos Mais Vendidos</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 30%, 20%)" />
              <XAxis type="number" stroke="hsl(270, 30%, 65%)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(270, 30%, 65%)" fontSize={11} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="vendas" name="Vendas" radius={[0, 4, 4, 0]}>
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-success" />
          <h3 className="text-lg font-bold text-foreground">Taxa de Conversão por Período</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conversionByPeriod}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 30%, 20%)" />
              <XAxis dataKey="periodo" stroke="hsl(270, 30%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(270, 30%, 65%)" fontSize={12} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="taxa"
                stroke="hsl(142, 70%, 45%)"
                strokeWidth={3}
                dot={{ fill: "hsl(142, 70%, 45%)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "hsl(142, 70%, 45%)" }}
                name="Taxa %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lead Distribution */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-bold text-foreground">Distribuição de Leads</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
