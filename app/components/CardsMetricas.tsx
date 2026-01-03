"use client";

import { DollarSign, TrendingUp, Timer, Users } from "lucide-react";

export default function CardsMetricas() {
  // Valores mockados para exemplo
  const metricas = [
    {
      label: "Faturamento Hoje",
      valor: "R$ 840,00",
      subtexto: "+12% em relação a ontem",
      cor: "text-green-500",
      icon: DollarSign,
    },
    {
      label: "Ticket Médio",
      valor: "R$ 65,00",
      subtexto: "Baseado em 13 atendimentos",
      cor: "text-blue-500",
      icon: TrendingUp,
    },
    {
      label: "Tempo Médio / Cliente",
      valor: "52 min",
      subtexto: "Meta: 45 min",
      cor: "text-brand-primary",
      icon: Timer,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metricas.map((item, idx) => (
        <div 
          key={idx} 
          className="bg-card border border-border p-6 rounded-[2rem] hover:border-brand-primary/30 transition-all group shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-muted border border-border ${item.cor} shadow-sm group-hover:border-brand-primary/20`}>
              <item.icon size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-brand-primary transition-colors">
              Live
            </span>
          </div>
          
          <div>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-4xl font-black text-foreground italic tracking-tighter">{item.valor}</h3>
            <p className="text-[10px] text-muted-foreground mt-2 font-black uppercase tracking-widest italic">{item.subtexto}</p>
          </div>
        </div>
      ))}
    </div>
  );
}