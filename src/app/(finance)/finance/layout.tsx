"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  FileText,
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/finance", icon: LayoutDashboard },
    { name: "Subscriptions", href: "/finance/subscriptions", icon: CreditCard },
    { name: "Expenses", href: "/finance/expenses", icon: Receipt },
    { name: "Reports Hub", href: "/finance/reports", icon: FileText },
    { name: "Analytics Dashboard", href: "/finance/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div>
          {/* Logo / Branding */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-500/20">
                P6
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                LTI Finance
              </span>
            </div>
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase block">
              PORTAL 6 — FINANCE & BILLING
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/finance" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Intern Identity Section */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold">
                PP
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">Prashanth P</p>
                <p className="text-xs text-slate-400 font-medium">Intern Code: P6-A5</p>
              </div>
            </div>
            <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 flex items-center justify-between">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                WEEK 1 MISSION
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
          {/* Active section title or date */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-400">
              System Live Date: June 19, 2026
            </span>
          </div>

          {/* Quick Metrics Header */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">MRR:</span>
              <span className="text-xs font-semibold text-emerald-400">$168,000</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">AR Overdue:</span>
              <span className="text-xs font-semibold text-amber-400">$33,200</span>
            </div>
          </div>

          {/* Account Profile info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">Report To:</p>
              <p className="text-xs font-semibold text-slate-200">Dilip Velayutham (SA)</p>
            </div>
          </div>
        </header>

        {/* Page Content container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
