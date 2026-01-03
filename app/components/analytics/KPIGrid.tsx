import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Scissors, Activity } from "lucide-react";
import { DashboardMetrics } from "@/app/barbearia/_actions/analytics";

interface KPIGridProps {
  metrics: DashboardMetrics;
}

export function KPIGrid({ metrics }: KPIGridProps) {
  const cards = [
    {
      title: "Faturamento Mensal",
      value: metrics.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      growth: metrics.revenueGrowth,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    },
    {
      title: "Novos Clientes",
      value: metrics.newClients.toString(),
      growth: metrics.newClientsGrowth,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Agendamentos",
      value: metrics.bookings.toString(),
      growth: metrics.bookingsGrowth,
      icon: Scissors,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Taxa de Ocupação",
      value: `${metrics.occupancyRate.toFixed(1)}%`,
      growth: 0, // Implementar growth depois
      icon: Activity,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
      border: "border-brand-primary/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className={`p-6 rounded-2xl border ${card.border} ${card.bg} relative overflow-hidden shadow-sm`}>
           <div className="flex justify-between items-start mb-4">
              <div>
                 <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{card.title}</p>
                 <h3 className="text-2xl font-black text-foreground mt-1 italic">{card.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-background/50 border border-border ${card.color}`}>
                 <card.icon size={20} />
              </div>
           </div>
           
           {card.growth !== 0 && (
             <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-tighter ${card.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {card.growth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(card.growth).toFixed(1)}% vs <span className="opacity-60 font-medium">mês anterior</span>
             </div>
           )}
        </div>
      ))}
    </div>
  );
}
