"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Lock, Sparkles, Terminal } from "lucide-react";

export default function LTIHubGateway() {
  const portals = [
    { num: "Portal 1", name: "Admin & Auth", desc: "Stateless security & role configuration", status: "System Auth" },
    { num: "Portal 2", name: "Corporate & Marketing", desc: "Public campaign site", status: "Simulated" },
    { num: "Portal 3", name: "Workspace & Collab", desc: "Internal projects and timesheets", status: "Simulated" },
    { num: "Portal 4", name: "LMS & Training", desc: "Course enrollment fees generator", status: "Simulated" },
    { num: "Portal 5", name: "CRM & Client Mgmt", desc: "Client contract signed events emitter", status: "Simulated" },
    { num: "Portal 6", name: "Finance & Billing", desc: "Invoices, payments, subscriptions & expenses", status: "ACTIVE WEEK 1", active: true },
    { num: "Portal 7", name: "HR & Talent", desc: "Staff registry & payroll integration", status: "Simulated" },
    { num: "Portal 8", name: "Analytics & Reporting", desc: "Aggregated nightly KPI snapshots", status: "Simulated" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            LH
          </div>
          <span className="font-bold text-slate-200">LTI Hub Platform</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg">
          <Terminal className="w-3.5 h-3.5" />
          <span>v1.0.0 Stable</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Developer Sandbox Environment</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            LTI Hub Portal Ecosystem
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Authorized gateway to the LTI Hub suite. Select the active finance module below to verify subscription trackers, expense reimbursements, tax calculations, and operational dashboards.
          </p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {portals.map((portal) => (
            <div
              key={portal.num}
              className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
                portal.active
                  ? "bg-slate-900 border-blue-500/40 shadow-xl shadow-blue-500/5 hover:border-blue-400"
                  : "bg-slate-900/40 border-slate-850/60 opacity-70 hover:opacity-80"
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{portal.num}</span>
                  {portal.active ? (
                    <span className="text-[9px] font-extrabold bg-blue-500/25 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold bg-slate-950 text-slate-500 border border-slate-850 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{portal.status}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-200">{portal.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{portal.desc}</p>
              </div>

              <div className="pt-4 mt-auto">
                {portal.active ? (
                  <Link
                    href="/finance"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Launch Portal 6</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-950 text-slate-600 border border-slate-850 font-semibold py-2 rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <span>Restricted Access</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-900/20 py-6 px-6 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 LTI Technologies. Confidential — Internal Use Only.</p>
      </footer>
    </div>
  );
}
