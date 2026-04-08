"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from "recharts";

interface CostData {
  name: string;
  value: number;
  color: string;
}

export function CostDistributionChart({ data }: { data: CostData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)'
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            content={({ payload }) => (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                {payload?.map((entry: any, index: number) => (
                  <div key={`item-${index}`} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
