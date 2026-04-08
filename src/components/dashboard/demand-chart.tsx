"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Legend
} from "recharts";

interface DemandData {
  month: string;
  medida: number;
  contratada: number;
}

export function DemandChart({ data }: { data: DemandData[] }) {
  // Pega a demanda contratada do último mês para mostrar como linha de referência
  const currentContracted = data[data.length - 1]?.contratada || 0;

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorMedida" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            unit=" kW"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)'
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            content={({ payload }) => (
              <div className="flex justify-end gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">Demanda Medida</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-rose-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">Limite Contratado</span>
                </div>
              </div>
            )}
          />
          <ReferenceLine 
            y={currentContracted} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            label={{ position: 'right', value: 'Contratada', fill: '#ef4444', fontSize: 10 }}
          />
          <Area 
            type="monotone" 
            dataKey="medida" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorMedida)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
