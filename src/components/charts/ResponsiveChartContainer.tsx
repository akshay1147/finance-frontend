"use client";

import React, { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  heightClass?: string;
}

export function ResponsiveChartContainer({
  title,
  description,
  children,
  heightClass = "h-64 sm:h-72 md:h-80"
}: Props) {
    <div 
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 flex flex-col justify-between overflow-hidden relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      tabIndex={0}
      role="region"
      aria-label={title}
    >
      <div>
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
        {description && (
          <p className="text-[10px] sm:text-xs text-slate-450 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className={`w-full ${heightClass} text-xs relative flex items-center justify-center min-w-0`}>
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
