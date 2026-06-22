import Link from "next/link";
import { 
  ArrowRight, 
  LayoutDashboard, 
  CreditCard, 
  ShieldCheck, 
  Lock,
  TrendingUp
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-slate-900 sticky top-0 z-10 bg-slate-950/20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-purple-500/20">
              LTI
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LTI Technologies
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold bg-slate-900/30 px-3 py-1 rounded-full border border-slate-800/60">
            <ShieldCheck size={14} className="text-purple-400" />
            <span>Portal 6 (Finance & Billing)</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col items-center justify-center text-center space-y-8 z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Frontend Delivery Package</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight max-w-3xl mx-auto">
            Operational Finance & Payment Gateways
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Experience the unified financial workspace for Portal 6. Manage invoices, reconcile bank clearing ledgers, execute secure checkout pipelines, and track subscriptions/expenses.
          </p>
        </div>

        {/* Triple Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-4">
          {/* Billing & Invoices */}
          <Link
            href="/dashboard"
            className="glass-card p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 text-left hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Billing & Invoices</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Enter the internal workspace for LTI Finance Teams. Check cash P&L records, manage active invoices, verify aging metrics, and simulate role-based configurations.
              </p>
            </div>
            <span className="text-purple-400 group-hover:text-purple-300 text-xs font-bold flex items-center space-x-1 mt-auto pt-2">
              <span>Access Invoices Portal</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {/* Subscriptions & Expenses */}
          <Link
            href="/finance"
            className="glass-card p-6 rounded-2xl border border-teal-500/20 hover:border-teal-500/40 text-left hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Subscriptions & Expenses</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Monitor recurring customer subscription directories, process employee expense claims, review financial reports, and inspect interactive visual intelligence widgets.
              </p>
            </div>
            <span className="text-teal-400 group-hover:text-teal-300 text-xs font-bold flex items-center space-x-1 mt-auto pt-2">
              <span>Access Reporting Hub</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {/* External Client checkout */}
          <Link
            href="/billing/pay?invoice=LTI-INV-2026-00104"
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700/60 text-left hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <CreditCard size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Client Checkout Portal</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Simulate the external client experience. Pay outstanding invoices online via our secure Stripe Elements card authorization gateway, fully decoupled from backend persistence layers.
              </p>
            </div>
            <span className="text-blue-400 group-hover:text-blue-300 text-xs font-bold flex items-center space-x-1 mt-auto pt-2">
              <span>Launch Payment Checkout</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Security / Compliance Badging */}
        <div className="flex flex-wrap justify-center items-center gap-6 pt-6 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center space-x-1">
            <Lock size={12} className="text-emerald-500" />
            <span>PCI-DSS Level 1 Secure Iframe</span>
          </div>
          <div className="flex items-center space-x-1">
            <ShieldCheck size={12} className="text-purple-400" />
            <span>Next.js 14 App Router (React 18)</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-900 text-center text-[10px] text-slate-500">
        © 2026 LTI Technologies Inc. Portal 6 Core Operations Interface. Unified Dashboard Delivery.
      </footer>
    </div>
  );
}
