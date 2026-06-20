"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Clock,
  X,
  Compass,
  TrendingUp,
  TrendingDown,
  Users
} from "lucide-react";
import { useAnalyticsLoader } from "@/hooks/useAnalyticsLoader";
import { AnalyticsErrorBoundary } from "@/components/analytics_error_boundary";
import { KPIChart } from "@/components/charts/KPIChart";
import { Expense } from "@/types/expense";
import dynamic from "next/dynamic";
import { DepartmentUsageChart } from "@/components/charts/DepartmentUsageChart";

const TrendChart = dynamic(() => import("@/components/charts/TrendChart").then(mod => mod.TrendChart), { ssr: false });
const LineChart = dynamic(() => import("@/components/charts/LineChart").then(mod => mod.LineChart), { ssr: false });
const DistributionChart = dynamic(() => import("@/components/charts/DistributionChart").then(mod => mod.DistributionChart), { ssr: false });

export default function AnalyticsPage() {
  const { analyticsData, expenses, loadingState, errorState, lastRefreshed, refresh } = useAnalyticsLoader();
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Drilldown state
  const [drilldownTitle, setDrilldownTitle] = useState("");
  const [drilldownData, setDrilldownData] = useState<Expense[]>([]);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

  function handleCategoryDrilldown(category: string) {
    const filtered = expenses.filter((e) => e.category === category);
    setDrilldownTitle(`Category Claims: ${category}`);
    setDrilldownData(filtered);
    setIsDrilldownOpen(true);
  }

  function handleDepartmentDrilldown(department: string) {
    const filtered = expenses.filter((e) => e.department === department);
    setDrilldownTitle(`Departmental Spend: ${department}`);
    setDrilldownData(filtered);
    setIsDrilldownOpen(true);
  }

  const trends = analyticsData?.trends || [];
  const categoryBreakdown = analyticsData?.expenseBreakdown || [];
  const departmentUsage = analyticsData?.departmentUsage || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Analytics</h1>
          <p className="text-xs text-slate-400">Deep-dive visual reporting into monthly expansion trends, churn rates, and departmental expense usage.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {lastRefreshed && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5" />
              <span>Refreshed: {lastRefreshed}</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
            <input
              type="checkbox"
              id="auto-refresh-toggle"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5 bg-slate-950 border-slate-800 rounded focus:ring-blue-500 text-blue-600 focus:ring-offset-slate-900"
            />
            <label htmlFor="auto-refresh-toggle" className="text-slate-350 cursor-pointer font-medium">
              Enable Auto-refresh
            </label>
          </div>

          <button
            onClick={refresh}
            disabled={loadingState.isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingState.isLoading ? "animate-spin" : ""}`} />
            <span>Sync Visuals</span>
          </button>
        </div>
      </div>

      {loadingState.isLoading && !analyticsData ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">{loadingState.message}</p>
        </div>
      ) : errorState.isError ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-2xl flex items-center gap-4 shadow-lg animate-fade-in">
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Analytics Dashboard Offline</h3>
            <p className="text-sm text-red-300/80">{errorState.error_message}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPIChart title="Compound MRR Growth" value="12.4%" subtitle="Average month-on-month growth" trendIcon={<TrendingUp />} trendStatus="positive" />
            <KPIChart title="Monthly Churn Rate" value="1.2%" subtitle="Record low client cancellation" trendIcon={<TrendingDown />} trendStatus="positive" />
            <KPIChart title="Renewal Rate" value="98.8%" subtitle="Client retention on renewals" trendIcon={<RefreshCw />} trendStatus="info" />
            <KPIChart title="Net Monthly Additions" value="+58" subtitle="New accounts added this quarter" trendIcon={<Users />} trendStatus="info" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 min-w-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 flex flex-col relative">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">MRR vs Expenses Growth</h3>
              </div>
              <AnalyticsErrorBoundary fallbackTitle="MRR Area Chart Failure">
                <TrendChart data={trends} xKey="month" areas={[{ key: "mrr", name: "Monthly Revenue", stroke: "#3b82f6" }, { key: "expenses", name: "Staff Expenses", stroke: "#ec4899" }]} />
              </AnalyticsErrorBoundary>
            </div>

            <div className="min-w-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 flex flex-col relative">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Expense Distribution</h3>
              </div>
              <AnalyticsErrorBoundary fallbackTitle="Category Pie Chart Failure">
                <DistributionChart data={categoryBreakdown.map(c => ({ label: c.category, value: c.amount, color: c.color || "#475569" }))} onSliceClick={handleCategoryDrilldown} />
              </AnalyticsErrorBoundary>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="min-w-0">
              <AnalyticsErrorBoundary fallbackTitle="Departmental Bar Chart Failure">
                <DepartmentUsageChart data={departmentUsage} onBarClick={handleDepartmentDrilldown} />
              </AnalyticsErrorBoundary>
            </div>

            <div className="lg:col-span-2 min-w-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 flex flex-col relative">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Subscriptions Expansion vs Churn</h3>
              </div>
              <AnalyticsErrorBoundary fallbackTitle="Churn Growth Line Chart Failure">
                <LineChart data={trends} xKey="month" lines={[{ key: "newSubscribers", name: "New Subscribers", stroke: "#10b981" }, { key: "churnRate", name: "Churn Rate (%)", stroke: "#ec4899", yAxisId: "right" }]} yAxes={[{ id: "left", orientation: "left" }, { id: "right", orientation: "right" }]} />
              </AnalyticsErrorBoundary>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Financial Intelligence Analytics Insight</span>
            </h4>
            <p className="text-xs text-slate-350 leading-relaxed">
              The MRR expansion rate experienced a net 7.6% increase during the June reporting cycle, driven largely by Enterprise tier contracts activation (Hooli Inc, Cyberdyne Systems). Meanwhile, operational expenses remained contained within corporate caps, with Engineering departmental claims making up 54% of total expenditures. Standard dunning controls have kept payment delays below the threshold.
            </p>
          </div>
        </>
      )}

      {isDrilldownOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-5 border-b border-slate-850">
              <div>
                <h3 className="text-base font-bold text-white mt-0.5">{drilldownTitle}</h3>
              </div>
              <button onClick={() => setIsDrilldownOpen(false)} className="text-slate-500 hover:text-slate-450 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[350px] overflow-y-auto">
              <div className="py-12 text-center text-slate-550 text-xs">
                {drilldownData.length} records matching criteria.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
