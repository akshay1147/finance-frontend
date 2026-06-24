"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleProvider, useRole, Role } from "@/context/RoleContext";
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  ExternalLink,
  ChevronDown
} from "lucide-react";

function FinanceLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentRole, setCurrentRole } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: Receipt },
    { name: "Payments", href: "/payments", icon: CreditCard },
  ];

  const roles: Role[] = ["Super Admin", "Finance Manager", "Accountant", "Billing Staff", "Auditor"];

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Financial Dashboard";
    if (pathname.startsWith("/invoices")) return "Invoice Management";
    if (pathname.startsWith("/payments")) return "Payment Ledger";
    return "Finance Portal";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-100">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b0f19] border-b border-slate-800/60 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-purple-500/20">
            LTI
          </div>
          <span className="font-semibold text-base tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Portal 6 <span className="text-xs font-normal text-slate-500">Finance</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#070b13] border-r border-slate-800/60 p-5 flex-shrink-0 min-h-screen">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-purple-500/30">
            LTI
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              LTI Technologies
            </span>
            <span className="text-xs text-purple-400 font-medium tracking-wider uppercase">
              Portal 6: Finance
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-600/10 text-purple-400 border-l-2 border-purple-500 pl-4"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Icon size={18} className={isActive ? "text-purple-400" : "text-slate-400"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Client Portal Link Shortcut */}
        <div className="my-4">
          <Link
            href="/billing/pay?invoice=LTI-INV-2026-00104"
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/60 transition-all"
          >
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Client Pay Checkout</span>
            </span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700/40">
            <User size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">JAYASHREE V</h4>
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider">
              Frontend Lead (P6-A4)
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-4/5 max-w-xs bg-[#070b13] h-full flex flex-col p-5 border-r border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-sm text-white">
                  LTI
                </div>
                <span className="font-semibold text-base">Portal 6</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-purple-600/10 text-purple-400 border-l-2 border-purple-500 pl-4"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/billing/pay?invoice=LTI-INV-2026-00104"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between w-full px-3 py-2.5 mb-4 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800"
              >
                <span>Client Pay Portal</span>
                <ExternalLink size={12} />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                  <User size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">JAYASHREE V</h4>
                  <p className="text-[10px] text-slate-500">P6-A4 Frontend Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar Header */}
        <header className="bg-[#030712]/40 backdrop-blur-md border-b border-slate-800/40 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>

          {/* Right Header Elements */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Live simulation indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Finance Sandbox Connected</span>
            </div>

            {/* Role Swapper Widget */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-[#0b0f19]/80 border border-slate-800 hover:border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 transition-all shadow-md"
              >
                <ShieldCheck size={14} className="text-purple-400" />
                <span className="hidden sm:inline">Role:</span>
                <span className="text-purple-300 font-semibold">{currentRole}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)}></div>
                  <ul className="absolute right-0 mt-2 w-52 bg-[#090d16] border border-slate-800 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                    <div className="px-2.5 py-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-800/60 mb-1">
                      Simulate JWT Role Claim
                    </div>
                    {roles.map((r) => (
                      <li key={r}>
                        <button
                          onClick={() => {
                            setCurrentRole(r);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                            currentRole === r
                              ? "bg-purple-600/15 text-purple-400"
                              : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                          }`}
                        >
                          <span>{r}</span>
                          {currentRole === r && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Render Outlet */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <FinanceLayoutContent>{children}</FinanceLayoutContent>
    </RoleProvider>
  );
}
