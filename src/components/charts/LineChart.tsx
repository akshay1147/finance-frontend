import React from "react";
import { LineChart as RechartsLineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LineConfig {
  key: string;
  name: string;
  stroke: string;
  yAxisId?: string;
}

interface LineChartProps {
  data: any[];
  xKey: string;
  lines: LineConfig[];
  yAxes?: { id: string; orientation?: 'left' | 'right' }[];
  heightClass?: string;
}

export function LineChart({ data, xKey, lines, yAxes = [{ id: "left", orientation: "left" }], heightClass = "h-64 sm:h-72" }: LineChartProps) {
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" as const }
  };

  return (
    <div className={`w-full ${heightClass} text-xs relative flex items-center justify-center min-w-0`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey={xKey} stroke="#64748b" tickLine={false} />
          {yAxes.map(axis => (
            <YAxis key={axis.id} yAxisId={axis.id} orientation={axis.orientation || "left"} stroke="#64748b" tickLine={false} />
          ))}
          <Tooltip {...customTooltipStyle} />
          <Legend />
          {lines.map((line, idx) => (
            <Line
              key={idx}
              name={line.name}
              yAxisId={line.yAxisId || "left"}
              type="monotone"
              dataKey={line.key}
              stroke={line.stroke}
              strokeWidth={2.5}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
