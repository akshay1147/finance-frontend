import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendArea {
  key: string;
  name: string;
  stroke: string;
}

interface TrendChartProps {
  data: any[];
  xKey: string;
  areas: TrendArea[];
  heightClass?: string;
}

export function TrendChart({ data, xKey, areas, heightClass = "h-64 sm:h-72 md:h-80" }: TrendChartProps) {
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" as const }
  };

  return (
    <div className={`w-full ${heightClass} text-xs relative flex items-center justify-center min-w-0`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {areas.map((area, idx) => (
              <linearGradient key={`grad-${idx}`} id={`color-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.stroke} stopOpacity={0.2} />
                <stop offset="95%" stopColor={area.stroke} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey={xKey} stroke="#64748b" tickLine={false} />
          <YAxis stroke="#64748b" tickLine={false} tickFormatter={(val) => `$${Number(val) / 1000}k`} />
          <Tooltip {...customTooltipStyle} formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]} />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
          {areas.map((area, idx) => (
            <Area
              key={idx}
              name={area.name}
              type="monotone"
              dataKey={area.key}
              stroke={area.stroke}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#color-${area.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
