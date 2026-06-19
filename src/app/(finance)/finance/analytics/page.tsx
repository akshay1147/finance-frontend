"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  RefreshCw,
  Users,
  Compass,
  TrendingDown
} from "lucide-react";

interface AnalyticsPayload {
  trends: { month: string; mrr: number; arr: number; expenses: number; newSubscribers: number; churnRate: number }[];
  expenseBreakdown: { category: string; amount: number; color: string }[];
  departmentUsage: { department: string; amount: number }[];
}

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const res = await fetch("/api/finance/analytics");
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      }
    }
    loadData();
  }, []);

  if (!mounted) {
    return <div className="py-20 text-center text-slate-500 text-sm">Initializing chart engine...</div>;
  }

  // Fallbacks if fetch fails
  const trends = analyticsData?.trends || [
    { month: "Jan", mrr: 125000, arr: 1500000, expenses: 45000, newSubscribers: 42, churnRate: 1.8 },
    { month: "Feb", mrr: 132000, arr: 1584000, expenses: 48000, newSubscribers: 48, churnRate: 1.5 },
    { month: "Mar", mrr: 141000, arr: 1692000, expenses: 52000, newSubscribers: 55, churnRate: 2.1 },
    { month: "Apr", mrr: 148000, arr: 1776000, expenses: 49000, newSubscribers: 50, churnRate: 1.9 },
    { month: "May", mrr: 156000, arr: 1872000, expenses: 58000, newSubscribers: 62, churnRate: 1.4 },
    { month: "Jun", mrr: 168000, arr: 2016000, expenses: 54000, newSubscribers: 70, churnRate: 1.2 }
  ];

  const categoryBreakdown = analyticsData?.expenseBreakdown || [
    { category: "Equipment", amount: 15400, color: "#3b82f6" },
    { category: "Travel", amount: 9800, color: "#10b981" },
    { category: "Accommodation", amount: 12600, color: "#f59e0b" },
    { category: "Meals", amount: 4200, color: "#ec4899" },
    { category: "Training", amount: 8500, color: "#8b5cf6" },
    { category: "Miscellaneous", amount: 2300, color: "#6b7280" }
  ];

  const departmentUsage = analyticsData?.departmentUsage || [
    { department: "Engineering", amount: 24500 },
    { department: "Sales", amount: 12800 },
    { department: "Marketing", amount: 9600 },
    { department: "HR", amount: 3200 },
    { department: "Finance", amount: 1400 },
    { department: "Operations", amount: 1300 }
  ];

  // Tooltip custom styling
  const customTooltipStyle = {
    contentStyle: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8", fontWeight: "bold" }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Analytics</h1>
        <p className="text-xs text-slate-400">Deep-dive visual reporting into monthly expansion trends, churn rates, and departmental expense usage.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Compound MRR Growth</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">12.4%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Average month-on-month growth</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Churn Rate</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">1.2%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Record low client cancellation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Renewal Rate</span>
            <RefreshCw className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">98.8%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Client retention on renewals</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Monthly Additions</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">+58</h3>
          <p className="text-[10px] text-slate-500 mt-1">New accounts added this quarter</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">MRR vs Expenses Growth</h3>
            <p className="text-xs text-slate-400">Monthly Recurring Revenue projection alongside corporate operating expenditures</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip {...customTooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Area name="Monthly Revenue" type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMRR)" />
                <Area name="Staff Expenses" type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Expense Distribution</h3>
            <p className="text-xs text-slate-400">Claims grouped by spending categories</p>
          </div>

          <div className="h-60 w-full text-xs relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="amount"
                  nameKey="category"
                >
                  {categoryBreakdown.map((entry: { category: string; amount: number; color: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#475569"} />
                  ))}
                </Pie>
                <Tooltip {...customTooltipStyle} formatter={(val) => [`$${Number(val ?? 0).toLocaleString()}`, "Claimed"]} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Total Expenses</span>
              <span className="text-lg font-bold text-slate-200">
                ${categoryBreakdown.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Simple custom legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            {categoryBreakdown.map((c: { category: string; amount: number; color: string }, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                <span className="truncate">{c.category} ({((c.amount / categoryBreakdown.reduce((s: number, entry: { amount: number }) => s + entry.amount, 0)) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Departmental Allocation Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Department Usage</h3>
            <p className="text-xs text-slate-400">Approved budget totals across business segments</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentUsage} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="department" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip {...customTooltipStyle} formatter={(val) => [`$${Number(val ?? 0).toLocaleString()}`, "Approved"]} />
                <Bar name="Approved Budget" dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {departmentUsage.map((entry: { department: string; amount: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#3b82f6" : "#475569"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Rate & Growth analytics line chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Subscriptions Expansion vs Churn</h3>
            <p className="text-xs text-slate-400">Relationship between subscriber retention (churn rate) and active accounts</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                <Tooltip {...customTooltipStyle} />
                <Legend />
                <Line name="New Subscribers" yAxisId="left" type="monotone" dataKey="newSubscribers" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line name="Churn Rate (%)" yAxisId="right" type="monotone" dataKey="churnRate" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Intelligence Insight Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>Financial Intelligence Analytics Insight</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          The MRR expansion rate experienced a net 7.6% increase during the June reporting cycle, driven largely by Enterprise tier contracts activation (Hooli Inc, Cyberdyne Systems). Meanwhile, operational expenses remained contained within corporate caps, with Engineering departmental claims making up 54% of total expenditures. Standard dunning controls have kept payment delays below the threshold.
        </p>
      </div>
    </div>
  );
}
