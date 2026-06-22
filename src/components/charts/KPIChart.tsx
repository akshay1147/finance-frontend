import React, { ReactNode } from "react";

interface KPIChartProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trendIcon?: ReactNode;
  trendText?: string;
  trendStatus?: "positive" | "negative" | "neutral" | "info";
}

export function KPIChart({ title, value, subtitle, trendIcon, trendText, trendStatus = "neutral" }: KPIChartProps) {
  const getStatusColorClass = () => {
    if (trendStatus === "positive") return "text-emerald-400";
    if (trendStatus === "negative") return "text-rose-400";
    if (trendStatus === "info") return "text-blue-400";
    return "text-slate-400";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</span>
        {trendIcon && <div className={getStatusColorClass()}>{trendIcon}</div>}
      </div>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      {(subtitle || trendText) && (
        <p className={`text-[10px] mt-1 ${trendText ? getStatusColorClass() + " font-medium" : "text-slate-500"}`}>
          {trendText || subtitle}
        </p>
      )}
    </div>
  );
}
