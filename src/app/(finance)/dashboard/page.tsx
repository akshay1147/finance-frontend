"use client";

import React, { memo } from "react";
import dynamic from "next/dynamic";
import { useRole } from "@/context/RoleContext";
import { useDashboardLoader } from "@/hooks/useDashboardLoader";
import OverdueAlert from "@/components/ui/OverdueAlert";
import { formatUSD } from "@/services/finance_transformer";
import {
  DollarSign,
  Receipt,
  Percent,
  Calendar,
  Lock,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const MRRTrendChart = dynamic(() => import("@/components/dashboard/MRRTrendChart"), {
  loading: () => (
    <div className="h-64 flex items-center justify-center text-slate-500 text-xs" role="status">
      Loading subscription metrics...
    </div>
  ),
  ssr: false,
});

const ARAgingChart = dynamic(() => import("@/components/dashboard/ARAgingChart"), {
  loading: () => (
    <div className="h-64 flex items-center justify-center text-slate-500 text-xs" role="status">
      Loading AR aging buckets...
    </div>
  ),
  ssr: false,
});

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "PAID": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "OVERDUE": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "SENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DISPUTED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <span className={`text-[9px] px-1.5 py-0.5 font-semibold rounded-full border ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
});

export default function DashboardPage() {
  const { currentRole, hasPermission } = useRole();
  const { data, loading, error } = useDashboardLoader(currentRole);
  const canViewReports = hasPermission("reports", "read");

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4" role="status" aria-live="polite">
        <RefreshCw className="animate-spin text-purple-500" size={32} aria-hidden="true" />
        <p className="text-slate-400 text-sm">Aggregating LTI financial metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4" role="alert">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  const { metrics, recentInvoices } = data;

  return (
    <div className="space-y-6">
      <OverdueAlert />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" role="region" aria-label="Financial KPI summary">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign size={16} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">{formatUSD(metrics.totalRevenueUSD)}</h3>
            <p className="text-xs text-emerald-400 mt-1">Reconciled payments</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Invoices</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Receipt size={16} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">{metrics.activeInvoicesCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Pending billing workflow</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Balances</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Calendar size={16} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">{formatUSD(metrics.outstandingPaymentsUSD)}</h3>
            <p className="text-xs text-rose-400 mt-1">Accounts receivable (AR)</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collection Rate</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Percent size={16} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">{metrics.collectionRate.toFixed(1)}%</h3>
            <p className="text-xs text-purple-400 mt-1">Bill-to-cash efficiency</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
              <div className="h-64 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-2 p-6 text-center" role="status">
                <Lock className="text-slate-500 animate-pulse" size={24} aria-hidden="true" />
                <h4 className="text-xs font-bold text-slate-300">Financial Reports Locked</h4>
                <p className="text-[10px] text-slate-500 max-w-xs">
                  Your current role ({currentRole}) does not have permission to view reporting pipelines.
                </p>
              </div>
            )}
          </div>

          <div className="glass-card p-5 md:p-6 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white">Accounts Receivable Aging</h3>
              <p className="text-xs text-slate-400 mt-0.5">Outstanding balance distribution grouped by invoice issue age</p>
            </div>
            {canViewReports ? (
              <ARAgingChart />
            ) : (
              <div className="h-64 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-2 p-6 text-center" role="status">
                <Lock className="text-slate-500" size={24} aria-hidden="true" />
                <h4 className="text-xs font-bold text-slate-300">AR Aging Restricted</h4>
                <p className="text-[10px] text-slate-500 max-w-xs">
                  Access requires Accountant, Auditor, or Finance Manager level privileges.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
                <Link
                  href="/invoices"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-0.5 font-medium transition-colors focus:ring-2 focus:ring-purple-500/50 rounded"
                >
                  <span>See all</span>
                  <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>

              <ul className="space-y-4" aria-label="Recent invoices">
                {recentInvoices.map((inv) => (
                  <li key={inv.invoice_id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-800/40">
                    <div className="overflow-hidden pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate">{inv.invoice_number}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{inv.account_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-extrabold text-white">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: inv.currency,
                          maximumFractionDigits: 2,
                        }).format(inv.total_amount)}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Due {new Date(inv.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider mb-2">Quick Shortcuts</h4>
              <Link
                href="/invoices?action=new"
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 transition-all focus:ring-2 focus:ring-purple-500/50"
              >
                <span>Launch Invoice Builder</span>
                <ArrowUpRight size={14} className="text-purple-400" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
