"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Percent
} from "lucide-react";

interface ReportTotals {
  activeSubscriptionRevenue: number;
  approvedExpenses: number;
  invoiceCount: number;
  expenseCount: number;
}

interface ARAgeingItem {
  bucket: string;
  amount: number;
  invoicesCount: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"financial" | "operational">("financial");
  const [reportType, setReportType] = useState("pl");
  const [dateRange, setDateRange] = useState("Q2-2026");
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState<ReportTotals | null>(null);
  const [arAgeing, setArAgeing] = useState<ARAgeingItem[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        const res = await fetch("/api/finance/reports");
        if (res.ok) {
          const data = await res.json();
          setTotals(data.totals);
          setArAgeing(data.arAgeing);
        }
      } catch (err) {
        console.error("Error loading report metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  function handleTriggerExport(format: "PDF" | "CSV") {
    setExporting(true);
    setExportMessage(`Compiling records for ${dateRange}...`);
    
    setTimeout(() => {
      setExportMessage(`Uploading document package to Cloudinary secure path...`);
      setTimeout(() => {
        setExporting(false);
        setExportMessage("");
        alert(`Success! Generated report exported to Cloudinary: lti-finance/reports/${reportType}_${dateRange}.${format.toLowerCase()}`);
      }, 1200);
    }, 1000);
  }

  // Simulated Report Data Tables
  const taxLiabilities = [
    { jurisdiction: "India (GST)", serviceType: "Professional IT Services", rate: "18%", collected: 24500, details: "9% CGST ($12,250) + 9% SGST ($12,250)" },
    { jurisdiction: "United Kingdom (VAT)", serviceType: "SaaS Subscriptions", rate: "20%", collected: 14800, details: "VAT standard rate registration" },
    { jurisdiction: "Germany (VAT)", serviceType: "LMS Course Licensing", rate: "19%", collected: 8600, details: "EU reverse-charge exempted" },
    { jurisdiction: "United States", serviceType: "Corporate Workspaces", rate: "Varies", collected: 6200, details: "TaxJar automated multi-state API" }
  ];

  const plItems = [
    { category: "Revenues", label: "Monthly Recurring Revenue (MRR)", amount: totals?.activeSubscriptionRevenue || 168000, type: "income" },
    { category: "Revenues", label: "One-time Contract Setup Fees", amount: 15400, type: "income" },
    { category: "Revenues", label: "LMS Course Access Purchases", amount: 12800, type: "income" },
    { category: "Expenses", label: "Approved Corporate Expenses", amount: totals?.approvedExpenses || 4049, type: "expense" },
    { category: "Expenses", label: "Stripe & Gateway Transaction Fees", amount: 4850, type: "expense" },
    { category: "Expenses", label: "SendGrid & SaaS Subscriptions", amount: 1200, type: "expense" }
  ];

  const totalIncome = plItems.filter(i => i.type === "income").reduce((s, i) => s + i.amount, 0);
  const totalExpense = plItems.filter(i => i.type === "expense").reduce((s, i) => s + i.amount, 0);
  const netIncome = totalIncome - totalExpense;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reporting Hub</h1>
          <p className="text-xs text-slate-400">Generate P&L statements, verify AR ageing buckets, and examine GST/VAT liabilities.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleTriggerExport("CSV")}
            disabled={exporting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleTriggerExport("PDF")}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Exporting Overlay Banner */}
      {exporting && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-blue-400 animate-spin"></div>
          <span className="text-xs text-blue-300 font-medium">{exportMessage}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="border-b border-slate-850 flex gap-6">
        <button
          onClick={() => { setActiveTab("financial"); setReportType("pl"); }}
          className={`pb-4 text-sm font-semibold transition-colors relative ${
            activeTab === "financial" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeTab === "financial" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></span>}
          <span>Financial Statements</span>
        </button>
        <button
          onClick={() => { setActiveTab("operational"); setReportType("dept"); }}
          className={`pb-4 text-sm font-semibold transition-colors relative ${
            activeTab === "operational" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeTab === "operational" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></span>}
          <span>Operational Reports</span>
        </button>
      </div>

      {/* Filter and Date Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {activeTab === "financial" ? (
            <div className="flex gap-2">
              <button
                onClick={() => setReportType("pl")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  reportType === "pl"
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300"
                }`}
              >
                Profit & Loss (P&L)
              </button>
              <button
                onClick={() => setReportType("tax")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  reportType === "tax"
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300"
                }`}
              >
                Tax Liabilities
              </button>
              <button
                onClick={() => setReportType("ar")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  reportType === "ar"
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300"
                }`}
              >
                AR Ageing Schedule
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setReportType("dept")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  reportType === "dept"
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300"
                }`}
              >
                Departmental Spend
              </button>
              <button
                onClick={() => setReportType("kpi")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  reportType === "kpi"
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300"
                }`}
              >
                KPI Snapshots
              </button>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5">
          <Calendar className="w-4 h-4 text-slate-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="June-2026">June 2026 (Current)</option>
            <option value="Q2-2026">Q2 2026 (Apr - Jun)</option>
            <option value="Q1-2026">Q1 2026 (Jan - Mar)</option>
            <option value="FY-2026">Full Year FY26</option>
          </select>
        </div>
      </div>

      {/* Render Selected Report View */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          Generating statements...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          {/* P&L Report Render */}
          {reportType === "pl" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Profit & Loss Statement</h3>
                  <p className="text-xs text-slate-400">Statement of revenues, expenses, and net margin results</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
                  {dateRange}
                </span>
              </div>

              {/* P&L Table */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Revenues</h4>
                  <div className="border border-slate-850 rounded-xl overflow-hidden divide-y divide-slate-850 text-xs">
                    {plItems.filter(i => i.type === "income").map((item, idx) => (
                      <div key={idx} className="flex justify-between p-3.5 bg-slate-950/20">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-semibold text-slate-200">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-3.5 bg-slate-950/60 font-bold text-white text-xs">
                      <span>Total Revenues</span>
                      <span>${totalIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Operating Expenses</h4>
                  <div className="border border-slate-850 rounded-xl overflow-hidden divide-y divide-slate-850 text-xs">
                    {plItems.filter(i => i.type === "expense").map((item, idx) => (
                      <div key={idx} className="flex justify-between p-3.5 bg-slate-950/20">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-semibold text-slate-200">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-3.5 bg-slate-950/60 font-bold text-white text-xs">
                      <span>Total Expenses</span>
                      <span>${totalExpense.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Income Summary */}
                <div className="bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-900/30 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Net Income / Profit</h4>
                    <p className="text-xs text-slate-400 mt-1">Revenues minus operating expenses</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-emerald-400">${netIncome.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-500 font-semibold mt-1">
                      {((netIncome / totalIncome) * 100).toFixed(1)}% net profit margin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tax Liabilities Render */}
          {reportType === "tax" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Tax Liabilities Summary</h3>
                  <p className="text-xs text-slate-400">Jurisdictional tax liability collections per regulatory requirements.</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
                  {dateRange}
                </span>
              </div>

              {/* Tax Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-3">Jurisdiction</th>
                      <th className="py-3">Applicable Service</th>
                      <th className="py-3">Rate</th>
                      <th className="py-3">Details / Audit</th>
                      <th className="py-3 text-right">Tax Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxLiabilities.map((tax, idx) => (
                      <tr key={idx} className="border-b border-slate-850 hover:bg-slate-850/10">
                        <td className="py-4 font-semibold text-slate-200">{tax.jurisdiction}</td>
                        <td className="py-4 text-slate-450">{tax.serviceType}</td>
                        <td className="py-4 font-mono text-slate-350">{tax.rate}</td>
                        <td className="py-4 text-[10px] text-slate-500">{tax.details}</td>
                        <td className="py-4 font-bold text-slate-200 text-right">
                          ${tax.collected.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AR Ageing Schedule Render */}
          {reportType === "ar" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Accounts Receivable Ageing</h3>
                  <p className="text-xs text-slate-400">Breakdown of unpaid invoices grouped by overdue intervals</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
                  {dateRange}
                </span>
              </div>

              {/* Buckets */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {arAgeing.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold block">{item.bucket}</span>
                    <span className="text-xl font-bold text-white block mt-1.5">${item.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Invoices count: {item.invoicesCount}</span>
                  </div>
                ))}
              </div>

              {/* Informational callout */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-xs text-amber-200">
                <Percent className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-semibold">Dunning Workflow Status Triggered</h4>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    There is currently $5,600 outstanding in the 90+ days bucket (SUB-9941, Wayne Enterprises). The automated dunning Sequence has concluded, and this contract requires manual write-off authorization by a Finance Manager.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Departmental Spend Render */}
          {reportType === "dept" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Departmental Spend Analysis</h3>
                  <p className="text-xs text-slate-400">Corporate budget usage by operational departments</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
                  {dateRange}
                </span>
              </div>

              <div className="border border-slate-850 rounded-xl overflow-hidden divide-y divide-slate-850 text-xs">
                {[
                  { dept: "Engineering", approved: "$24,500", pending: "$620", cap: "$30,000", percentage: "81%" },
                  { dept: "Sales", approved: "$12,800", pending: "$0", cap: "$20,000", percentage: "64%" },
                  { dept: "Marketing", approved: "$9,600", pending: "$0", cap: "$15,000", percentage: "64%" },
                  { dept: "HR", approved: "$3,200", pending: "$0", cap: "$10,000", percentage: "32%" },
                  { dept: "Finance", approved: "$1,400", pending: "$145", cap: "$5,000", percentage: "28%" },
                  { dept: "Operations", approved: "$1,300", pending: "$0", cap: "$5,000", percentage: "26%" }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="sm:w-1/4">
                      <span className="font-semibold text-slate-200">{item.dept}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                        <div
                          className="bg-blue-500 h-full"
                          style={{ width: item.percentage }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{item.percentage}</span>
                    </div>

                    <div className="sm:w-1/3 text-right flex flex-col sm:items-end justify-center">
                      <p className="font-bold text-slate-200">{item.approved} approved</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Budget cap: {item.cap} | Pending: {item.pending}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPI Snapshot Render */}
          {reportType === "kpi" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">KPI Dashboard Feed</h3>
                  <p className="text-xs text-slate-400">Nightly aggregated KPIs exported to the Analytics Portal (Portal 8)</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
                  Daily Nightly Trigger
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MRR Expansion Rate</h4>
                  <p className="text-2xl font-extrabold text-white">12.4%</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Outperforming target of 10.0%</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subscription Churn</h4>
                  <p className="text-2xl font-extrabold text-white">1.2%</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Down 0.6% compared to Q1</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Collection Period</h4>
                  <p className="text-2xl font-extrabold text-white">14 Days</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Average outstanding settlement speed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
