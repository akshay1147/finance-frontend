"use client";

import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { RevenueTrend } from "@/types/analytics";
import { ResponsiveChartContainer } from "./ResponsiveChartContainer";

interface Props {
  data: RevenueTrend[];
}

export function MRRChart({ data }: Props) {
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" as const }
  };

  return (
    <ResponsiveChartContainer
      title="MRR vs Expenses Growth"
      description="Monthly Recurring Revenue projection alongside corporate operating expenditures"
    >
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
        <YAxis
          stroke="#64748b"
          tickLine={false}
          tickFormatter={(val) => `$${Number(val) / 1000}k`}
        />
        <Tooltip {...customTooltipStyle} formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Area
          name="Monthly Revenue"
          type="monotone"
          dataKey="mrr"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorMRR)"
        />
        <Area
          name="Staff Expenses"
          type="monotone"
          dataKey="expenses"
          stroke="#ec4899"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorExpenses)"
        />
      </AreaChart>
    </ResponsiveChartContainer>
  );
}
