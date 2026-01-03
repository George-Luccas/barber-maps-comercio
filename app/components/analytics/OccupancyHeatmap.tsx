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
      if (count === 0) return 'bg-zinc-800/50';
      const ratio = count / (maxCount || 1);
      if (ratio < 0.3) return 'bg-yellow-500/20';
      if (ratio < 0.6) return 'bg-yellow-500/50';
      return 'bg-yellow-500';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full overflow-x-auto">
      <h3 className="text-lg font-bold text-white mb-4">Mapa de Frequência</h3>
      
      <div className="min-w-[500px]">
          {/* Header Dias */}
          <div className="grid grid-cols-[50px_repeat(6,1fr)] mb-2">
             <div />
             {weekDays.map(day => (
                 <div key={day} className="text-center text-xs font-bold text-zinc-500 uppercase">{day}</div>
             ))}
          </div>

          {/* Linhas de Horas */}
          {hours.map(hour => (
             <div key={hour} className="grid grid-cols-[50px_repeat(6,1fr)] gap-1 mb-1 items-center">
                 <div className="text-xs text-zinc-600 font-mono text-right pr-2">
                     {hour}:00
                 </div>
                 {weekDays.map(day => {
                     const count = dataMap.get(`${day}-${hour}`) || 0;
                     return (
                         <div 
                            key={`${day}-${hour}`}
                            title={`${day} ${hour}:00 - ${count} atendimentos`}
                            className={`h-8 rounded-md transition-all hover:border hover:border-white/20 ${getIntensityClass(count)}`}
                         />
                     );
                 })}
             </div>
          ))}
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-zinc-500 font-bold uppercase">
          <span>Menos mov.</span>
          <div className="flex gap-1">
              <div className="w-3 h-3 bg-zinc-800/50 rounded" />
              <div className="w-3 h-3 bg-yellow-500/20 rounded" />
              <div className="w-3 h-3 bg-yellow-500/50 rounded" />
              <div className="w-3 h-3 bg-yellow-500 rounded" />
          </div>
          <span>Mais mov.</span>
      </div>
    </div>
  );
}
