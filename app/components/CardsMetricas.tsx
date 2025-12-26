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
      cor: "text-yellow-500",
      icon: Timer,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {metricas.map((item, idx) => (
        <div 
          key={idx} 
          className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-700 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-black/50 border border-zinc-800 ${item.cor}`}>
              <item.icon size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">
              Live
            </span>
          </div>
          
          <div>
            <p className="text-zinc-500 text-xs font-bold uppercase mb-1">{item.label}</p>
            <h3 className="text-3xl font-black text-white italic tracking-tight">{item.valor}</h3>
            <p className="text-[10px] text-zinc-600 mt-2 font-medium">{item.subtexto}</p>
          </div>
        </div>
      ))}
    </div>
  );
}