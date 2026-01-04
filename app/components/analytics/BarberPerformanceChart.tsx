"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { User, Scissors, DollarSign } from 'lucide-react';

interface BarberPerformance {
  name: string;
  revenue: number;
  cuts: number;
  imageUrl?: string | null;
}

interface BarberPerformanceChartProps {
  data: BarberPerformance[];
}

const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f97316', '#64748b'];

export function BarberPerformanceChart({ data }: BarberPerformanceChartProps) {
  const [metric, setMetric] = useState<'revenue' | 'cuts'>('revenue');

  if (!data || data.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <User size={32} className="opacity-20" />
              <span className="text-xs uppercase font-bold tracking-widest opacity-50">Sem dados de equipe</span>
          </div>
      )
  }

  const renderData = data.map(d => ({
    ...d,
    value: metric === 'revenue' ? d.revenue : d.cuts
  })).filter(d => d.value > 0);

  const total = renderData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-full w-full flex flex-col">
        {/* Toggle Controls */}
        <div className="flex justify-center gap-2 mb-4">
            <button
                onClick={() => setMetric('revenue')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${metric === 'revenue' ? 'bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted'}`}
            >
                <DollarSign size={12} /> Faturamento
            </button>
            <button
                onClick={() => setMetric('cuts')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${metric === 'cuts' ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted'}`}
            >
                <Scissors size={12} /> Cortes
            </button>
        </div>

        <div className="flex-1 min-h-[250px] relative">
            {/* Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total</span>
                <span className={`text-2xl font-black italic ${metric === 'revenue' ? 'text-green-500' : 'text-blue-500'}`}>
                    {metric === 'revenue' 
                        ? Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) 
                        : total}
                </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                <Pie
                    data={renderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    cornerRadius={5}
                    stroke="none"
                >
                    {renderData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="stroke-card stroke-2"
                        // Glow effect attempt via filter (svg) is hard in recharts props, but we can rely on colors.
                    />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        borderColor: 'rgba(255,255,255,0.1)', 
                        borderRadius: '1rem',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number | undefined) => [
                        metric === 'revenue' 
                            ? (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                            : `${value || 0} Cortes`,
                        ""
                    ]}
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    content={({ payload }) => (
                         <div className="flex flex-wrap justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-4">
                            {payload?.map((entry: any, index: number) => (
                                <div key={`item-${index}`} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }} />
                                    <span>{entry.value}</span>
                                </div>
                            ))}
                         </div>
                    )}
                />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}
