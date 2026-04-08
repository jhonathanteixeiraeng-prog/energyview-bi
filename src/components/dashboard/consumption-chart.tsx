"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from "recharts";

interface ConsumptionData {
  month: string;
  ponta: number;
  foraPonta: number;
}

export function ConsumptionChart({ data }: { data: ConsumptionData[] }) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPonta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorForaPonta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
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
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
            }}
            itemStyle={{ fontSize: '12px', fontWeight: 500 }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            content={({ payload }) => (
              <div className="flex justify-end gap-6 mb-4">
                {payload?.map((entry: any, index: number) => (
                  <div key={`item-${index}`} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
          <Bar 
            dataKey="ponta" 
            name="Ponta" 
            stackId="a" 
            fill="url(#colorPonta)" 
            radius={[0, 0, 0, 0]} 
            barSize={32}
          />
          <Bar 
            dataKey="foraPonta" 
            name="Fora Ponta" 
            stackId="a" 
            fill="url(#colorForaPonta)" 
            radius={[6, 6, 0, 0]} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
