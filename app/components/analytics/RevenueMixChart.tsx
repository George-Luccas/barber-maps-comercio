"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MixItem {
  name: string;
  value: number;
  type: string;
}

interface RevenueMixChartProps {
  data: MixItem[];
}

const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f97316'];

export function RevenueMixChart({ data }: RevenueMixChartProps) {
  if (!data || data.length === 0) {
      return (
          <div className="h-[300px] flex items-center justify-center text-zinc-500 text-xs uppercase font-bold">
              Sem dados suficientes
          </div>
      )
  }

  // Agrupa pequenos valores em "Outros" se houver muitos itens
  let renderData = data;
  if (data.length > 6) {
      const top5 = data.slice(0, 5);
      const others = data.slice(5).reduce((acc, curr) => acc + curr.value, 0);
      renderData = [...top5, { name: 'Outros', value: others, type: 'mixed' }];
  }

  return (
    <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
            <Pie
                data={renderData as any[]}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
            >
                {renderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                ))}
            </Pie>
            <Tooltip
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)', 
                  borderRadius: '1rem',
                  color: 'var(--foreground)',
                  fontSize: '10px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  zIndex: 100
                }}
                itemStyle={{ color: 'var(--foreground)' }}
                formatter={(value: any, name: any) => [
                    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    name
                ]}
            />
            <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '10px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
            />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
}
