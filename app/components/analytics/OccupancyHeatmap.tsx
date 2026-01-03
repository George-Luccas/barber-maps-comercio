"use client";

interface HeatmapData {
  day: string;
  hour: number;
  count: number;
}

interface OccupancyHeatmapProps {
  data: HeatmapData[];
}

export function OccupancyHeatmap({ data }: OccupancyHeatmapProps) {
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; // Ignorando Dom por enquanto se for fechado, ou incluir
  const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 09:00 as 21:00

  // Mapa rápido de acesso
  const dataMap = new Map<string, number>();
  let maxCount = 0;
  
  data.forEach(d => {
      dataMap.set(`${d.day}-${d.hour}`, d.count);
      if (d.count > maxCount) maxCount = d.count;
  });

  const getIntensityClass = (count: number) => {
      if (count === 0) return 'bg-muted/30';
      const ratio = count / (maxCount || 1);
      if (ratio < 0.3) return 'bg-brand-primary/20';
      if (ratio < 0.6) return 'bg-brand-primary/50';
      return 'bg-brand-primary';
  };

  return (
    <div className="h-full w-full overflow-x-auto scrollbar-hide">
      <div className="min-w-[500px]">
          {/* Header Dias */}
          <div className="grid grid-cols-[50px_repeat(6,1fr)] mb-4">
             <div />
             {weekDays.map(day => (
                 <div key={day} className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">{day}</div>
             ))}
          </div>

          {/* Linhas de Horas */}
          {hours.map(hour => (
             <div key={hour} className="grid grid-cols-[50px_repeat(6,1fr)] gap-2 mb-2 items-center">
                 <div className="text-[10px] text-muted-foreground font-black text-right pr-3 italic">
                     {hour}:00
                 </div>
                 {weekDays.map(day => {
                     const count = dataMap.get(`${day}-${hour}`) || 0;
                     return (
                         <div 
                            key={`${day}-${hour}`}
                            title={`${day} ${hour}:00 - ${count} atendimentos`}
                            className={`h-8 rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-primary/20 ${getIntensityClass(count)}`}
                         />
                     );
                 })}
             </div>
          ))}
      </div>
      
      <div className="mt-6 flex items-center justify-end gap-3 text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">
          <span>Menos mov.</span>
          <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-muted/30 rounded-sm" />
              <div className="w-3 h-3 bg-brand-primary/20 rounded-sm" />
              <div className="w-3 h-3 bg-brand-primary/50 rounded-sm" />
              <div className="w-3 h-3 bg-brand-primary rounded-sm" />
          </div>
          <span>Mais mov.</span>
      </div>
    </div>
  );
}
