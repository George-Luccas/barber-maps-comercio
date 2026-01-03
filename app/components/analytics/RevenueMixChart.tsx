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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
       <h3 className="text-lg font-bold text-white mb-4">Mix de Receita</h3>
       <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                data={renderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
            >
                {renderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                ))}
            </Pie>
            <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any, name: any) => [
                    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    name
                ]}
            />
            <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
       </div>
    </div>
  );
}
