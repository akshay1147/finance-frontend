"use client";

import React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { DepartmentUsage } from "@/types/analytics";
import { ResponsiveChartContainer } from "./ResponsiveChartContainer";

interface Props {
  data: DepartmentUsage[];
  onBarClick?: (department: string) => void;
}

export function DepartmentUsageChart({ data, onBarClick }: Props) {
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" as const }
  };

  return (
    <ResponsiveChartContainer
      title="Department Usage"
      description="Approved budget totals across business segments (Click bar for details)"
      heightClass="h-64 sm:h-72"
    >
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="department" stroke="#64748b" tickLine={false} />
        <YAxis
          stroke="#64748b"
          tickLine={false}
          tickFormatter={(val) => `$${Number(val) / 1000}k`}
        />
        <Tooltip {...customTooltipStyle} formatter={(val) => [`$${Number(val).toLocaleString()}`, "Approved"]} />
        <Bar
          name="Approved Budget"
          dataKey="amount"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          onClick={(entry: any) => onBarClick?.(entry.payload?.department)}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "#3b82f6" : "#475569"}
              className="hover:opacity-85 transition-opacity"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveChartContainer>
  );
}
