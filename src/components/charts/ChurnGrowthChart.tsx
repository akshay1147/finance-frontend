"use client";

import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { RevenueTrend } from "@/types/analytics";
import { ResponsiveChartContainer } from "./ResponsiveChartContainer";

interface Props {
  data: RevenueTrend[];
}

export function ChurnGrowthChart({ data }: Props) {
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" as const }
  };

  return (
    <ResponsiveChartContainer
      title="Subscriptions Expansion vs Churn"
      description="Relationship between subscriber retention (churn rate) and active accounts"
      heightClass="h-64 sm:h-72"
    >
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
        <YAxis yAxisId="left" stroke="#64748b" tickLine={false} />
        <YAxis yAxisId="right" orientation="right" stroke="#64748b" tickLine={false} />
        <Tooltip {...customTooltipStyle} />
        <Legend />
        <Line
          name="New Subscribers"
          yAxisId="left"
          type="monotone"
          dataKey="newSubscribers"
          stroke="#10b981"
          strokeWidth={2.5}
          activeDot={{ r: 6 }}
        />
        <Line
          name="Churn Rate (%)"
          yAxisId="right"
          type="monotone"
          dataKey="churnRate"
          stroke="#ec4899"
          strokeWidth={2.5}
        />
      </LineChart>
    </ResponsiveChartContainer>
  );
}
