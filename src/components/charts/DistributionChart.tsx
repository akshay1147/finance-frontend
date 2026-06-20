import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DistributionData {
  label: string;
  value: number;
  color: string;
}

interface DistributionChartProps {
  data: DistributionData[];
  onSliceClick?: (label: string) => void;
  heightClass?: string;
}

export function DistributionChart({ data, onSliceClick, heightClass = "h-60" }: DistributionChartProps) {
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" as const }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`w-full ${heightClass} text-xs relative flex flex-col items-center justify-center min-w-0`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              nameKey="label"
              onClick={(entry) => onSliceClick?.(entry.label)}
              className={onSliceClick ? "cursor-pointer" : ""}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#475569"} />
              ))}
            </Pie>
            <Tooltip {...customTooltipStyle} formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Center label */}
      <div className="absolute text-center pointer-events-none flex flex-col justify-center items-center inset-0 z-0">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Total</span>
        <span className="text-base sm:text-lg font-extrabold text-slate-200">
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
