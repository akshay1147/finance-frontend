"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  Receipt,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { Subscription, Expense } from "@/lib/mockData";

export default function FinanceDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [subsRes, expsRes] = await Promise.all([
          fetch("/api/finance/subscriptions"),
          fetch("/api/finance/expenses")
        ]);

        if (!subsRes.ok || !expsRes.ok) {
          throw new Error("Failed to retrieve dashboard data from APIs");
        }

        const subsData = await subsRes.json();
        const expsData = await expsRes.json();

        setSubscriptions(subsData);
        setExpenses(expsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Compute metrics from current state
  const activeSubsCount = subscriptions.filter(s => s.status === "Active").length;
  const expiringCount = subscriptions.filter(s => s.status === "Expiring").length;
  
  const mrr = subscriptions
    .filter(s => s.status === "Active" || s.status === "Expiring")
    .reduce((sum, s) => {
      let monthlyVal = s.amount;
      if (s.billing_cycle === "Quarterly") monthlyVal = s.amount / 3;
      if (s.billing_cycle === "Annual") monthlyVal = s.amount / 12;
      return sum + monthlyVal;
    }, 0);

  const arr = mrr * 12;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = expenses
    .filter(e => e.status === "Approved")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-900/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Portal 6 Dashboard Live</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Finance & Billing Portal
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
              Welcome back, Prashanth! Monitor monthly recurring revenue, authorize staff expenses, generate operational reports, and review financial intelligence widgets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/finance/subscriptions"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2"
            >
              <span>Manage Subscriptions</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/finance/expenses"
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-xl transition-all duration-200 text-sm flex items-center gap-2"
            >
              <span>Verify Expenses</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Fetching financial summaries...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Failed to load Dashboard</h3>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: MRR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>+7.6%</span>
                </span>
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Monthly Recurring Revenue
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                ${mrr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span>ARR projection:</span>
                <span className="text-slate-300 font-semibold">
                  ${arr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Card 2: Active Subscriptions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xs text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded-full">
                  {expiringCount} expiring soon
                </span>
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Active Subscriptions
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">{activeSubsCount}</h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span>Total records:</span>
                <span className="text-slate-300 font-semibold">{subscriptions.length}</span>
              </div>
            </div>

            {/* Card 3: Total Expenses */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Receipt className="w-6 h-6" />
                </div>
                <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full">
                  {expenses.filter(e => e.status === "Pending").length} pending
                </span>
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Total Claims Value
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                ${totalExpenses.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span>Approved:</span>
                <span className="text-emerald-400 font-semibold">${approvedExpenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Card 4: Outstanding Receivables */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                  92.4% Coll. Rate
                </span>
              </div>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Accounts Receivable
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">$48,500</h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span>Overdue (30d+):</span>
                <span className="text-rose-400 font-semibold">$33,200</span>
              </div>
            </div>
          </div>

          {/* Quick List Overviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Subscriptions Dashboard View */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Active Subscriptions</h3>
                  <p className="text-xs text-slate-400">Latest recurring customer subscriptions</p>
                </div>
                <Link
                  href="/finance/subscriptions"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {subscriptions.slice(0, 4).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {sub.customer_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{sub.customer_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{sub.plan}</span>
                          <span>•</span>
                          <span>{sub.billing_cycle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-200">
                        ${sub.amount.toLocaleString()}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1.5 ${
                          sub.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : sub.status === "Expiring"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses Dashboard View */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Expense Tracker</h3>
                  <p className="text-xs text-slate-400">Claims awaiting reimbursement or approval</p>
                </div>
                <Link
                  href="/finance/expenses"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {expenses.slice(0, 4).map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {exp.category.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{exp.notes}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{exp.employee_name}</span>
                          <span>•</span>
                          <span>{exp.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-200">
                        ${exp.amount.toLocaleString()}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1.5 ${
                          exp.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : exp.status === "Pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {exp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Informational Notice */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">PCI-DSS Compliant Infrastructure</h4>
                <p className="text-xs text-slate-400">All payment workflows are securely tokensied using Stripe. Sensitive client billing information is protected at rest.</p>
              </div>
            </div>
            <Link
              href="/finance/reports"
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl transition-all shrink-0"
            >
              Configure compliance templates
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
