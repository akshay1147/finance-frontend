"use client";

import React, { useEffect, useState } from "react";
import { useRole } from "@/context/RoleContext";
import OverdueAlert from "@/components/ui/OverdueAlert";
import ARAgingChart from "@/components/dashboard/ARAgingChart";
import MRRTrendChart from "@/components/dashboard/MRRTrendChart";
import { getFinanceMetrics, getInvoices, Invoice } from "@/services/api";
import { 
  DollarSign, 
  Receipt, 
  Percent, 
  Calendar, 
  Lock, 
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { currentRole, hasPermission } = useRole();
  const [metrics, setMetrics] = useState<ReturnType<typeof getFinanceMetrics> | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setMetrics(getFinanceMetrics());
      const allInvoices = getInvoices();
      // Get 4 most recent invoices
      const sorted = [...allInvoices].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentInvoices(sorted.slice(0, 4));
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentRole]); // Refresh if role changes

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "OVERDUE": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "SENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DISPUTED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // Check if current role has permission to see financial reports (reports -> read)
  const canViewReports = hasPermission("reports", "read");

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-purple-500" size={32} />
        <p className="text-slate-400 text-sm">Aggregating LTI financial metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications / Alerts banner */}
      <OverdueAlert />

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={80} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign size={16} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              {formatUSD(metrics.totalRevenueUSD)}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
              <span>Reconciled payments</span>
            </p>
          </div>
        </div>

        {/* Active Invoices */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Receipt size={80} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Invoices
            </span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Receipt size={16} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              {metrics.activeInvoicesCount}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pending billing workflow
            </p>
          </div>
        </div>

        {/* Outstanding Payments */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar size={80} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Outstanding Balances
            </span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Calendar size={16} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              {formatUSD(metrics.outstandingPaymentsUSD)}
            </h3>
            <p className="text-xs text-rose-400 mt-1">
              Accounts receivable (AR)
            </p>
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Percent size={80} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Collection Rate
            </span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Percent size={16} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              {metrics.collectionRate.toFixed(1)}%
            </h3>
            <p className="text-xs text-purple-400 mt-1">
              Bill-to-cash efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Main Section - Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Financial Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* MRR & Sales Trend Chart */}
          <div className="glass-card p-5 md:p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">MRR & Recurring Subscription Growth</h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly Recurring Revenue vs sales gains and churn</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Estimated MRR</span>
                <div className="text-sm font-bold text-purple-400">{formatUSD(metrics.mrrUSD)}/mo</div>
              </div>
            </div>

            {canViewReports ? (
              <MRRTrendChart />
            ) : (
              <div className="h-64 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-2 p-6 text-center">
                <Lock className="text-slate-500 animate-pulse" size={24} />
                <h4 className="text-xs font-bold text-slate-300">Financial Reports Locked</h4>
                <p className="text-[10px] text-slate-500 max-w-xs">
                  Your current simulated role ({currentRole}) does not have permission to view reporting pipelines. Switch roles in the header.
                </p>
              </div>
            )}
          </div>

          {/* AR Aging buckets */}
          <div className="glass-card p-5 md:p-6 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white">Accounts Receivable Aging</h3>
              <p className="text-xs text-slate-400 mt-0.5">Outstanding balance distribution grouped by invoice issue age</p>
            </div>
            {canViewReports ? (
              <ARAgingChart />
            ) : (
              <div className="h-64 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-2 p-6 text-center">
                <Lock className="text-slate-500" size={24} />
                <h4 className="text-xs font-bold text-slate-300">AR Aging Restricted</h4>
                <p className="text-[10px] text-slate-500 max-w-xs">
                  Access requires Accountant, Auditor, or Finance Manager level privileges.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Recent invoices list */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
                <Link 
                  href="/invoices" 
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-0.5 font-medium transition-colors"
                >
                  <span>See all</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              <div className="space-y-4">
                {recentInvoices.map((inv) => (
                  <div key={inv.invoice_id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-800/40">
                    <div className="overflow-hidden pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate">
                          {inv.invoice_number}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 font-semibold rounded-full border ${getStatusBadgeClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        {inv.account_name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-extrabold text-white">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: inv.currency,
                          maximumFractionDigits: 2
                        }).format(inv.total_amount)}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Due {new Date(inv.due_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider mb-2">
                Quick Shortcuts
              </h4>
              <Link
                href="/invoices?action=new"
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 transition-all text-center"
              >
                <span>Launch Invoice Builder</span>
                <ArrowUpRight size={14} className="text-purple-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
