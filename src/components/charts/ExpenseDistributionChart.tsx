"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { ExpenseBreakdown } from "@/types/analytics";

interface Props {
  data: ExpenseBreakdown[];
  onSliceClick?: (category: string) => void;
}

export function ExpenseDistributionChart({ data, onSliceClick }: Props) {
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" as const }
  };

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 flex flex-col justify-between relative min-w-0">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Expense Distribution</h3>
        <p className="text-[10px] sm:text-xs text-slate-450 mt-0.5 leading-relaxed">
          Claims grouped by spending categories (Click slice for details)
        </p>
      </div>

      <div className="h-60 w-full text-xs relative flex items-center justify-center min-w-0">
        <PieChart width={220} height={220}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="amount"
            nameKey="category"
            onClick={(entry: any) => onSliceClick?.(entry.payload?.category || entry.name)}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#475569"} />
            ))}
          </Pie>
          <Tooltip {...customTooltipStyle} formatter={(val) => [`$${Number(val).toLocaleString()}`, "Claimed"]} />
        </PieChart>
        
        {/* Center label */}
        <div className="absolute text-center pointer-events-none">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Total Expenses</span>
          <span className="text-base sm:text-lg font-extrabold text-slate-200">
            ${total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid Legend */}
      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-slate-800/60 pt-4">
        {data.map((c, idx) => (
          <button
            key={idx}
            onClick={() => onSliceClick?.(c.category)}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left font-medium min-w-0 truncate"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
            <span className="truncate">
              {c.category} ({total > 0 ? ((c.amount / total) * 100).toFixed(0) : 0}%)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
