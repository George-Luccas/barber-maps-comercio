
"use client";

import { BarberAnalytics } from "../_actions/get-analytics";
import { User, CalendarCheck, DollarSign, Trophy } from "lucide-react";

interface BarberAnalyticsListProps {
  data: BarberAnalytics[];
}

export function BarberAnalyticsList({ data }: BarberAnalyticsListProps) {
  
  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
            <Trophy size={48} className="mb-4" />
            <p className="font-medium">Sem dados de desempenho ainda</p>
        </div>
    );
  }

  // Find top performer for special styling
  const topPerformerId = data[0]?.id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {data.map((barber, index) => {
        const isTop = barber.id === topPerformerId && barber.totalServices > 0;
        
        return (
          <div 
            key={barber.id} 
            className={`
                relative bg-card border rounded-[2rem] p-6 flex flex-col items-center shadow-lg transition-all hover:scale-[1.02]
                ${isTop ? 'border-brand-primary/50 shadow-brand-primary/10' : 'border-border/50'}
            `}
          >
            {isTop && (
                <div className="absolute -top-4 bg-brand-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <Trophy size={12} />
                    Destaque
                </div>
            )}

            <div className="w-20 h-20 rounded-full bg-muted border-4 border-card shadow-xl mb-4 relative overflow-hidden">
               {barber.imageUrl ? (
                 <img src={barber.imageUrl} alt={barber.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary">
                   <User size={32} />
                 </div>
               )}
            </div>

            <h3 className="text-lg font-black uppercase text-foreground mb-1 text-center">{barber.name}</h3>
            <div className="text-3xl font-black text-brand-primary mb-6">{barber.totalServices} <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Atendimentos</span></div>

            <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <CalendarCheck size={20} className="text-blue-500 mb-2" />
                    <span className="text-xl font-bold text-foreground leading-none">{barber.bookingsCount}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Agendados</span>
                </div>
                <div className="bg-muted/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <DollarSign size={20} className="text-green-500 mb-2" />
                    <span className="text-xl font-bold text-foreground leading-none">{barber.transactionsCount}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Lançados</span>
                </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}
