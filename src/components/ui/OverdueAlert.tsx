"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getInvoices } from "@/services/api";

export default function OverdueAlert() {
  const [overdueCount, setOverdueCount] = useState(0);
  const [totalOverdueUSD, setTotalOverdueUSD] = useState(0);

  useEffect(() => {
    const invoices = getInvoices();
    const overdue = invoices.filter((i) => i.status === "OVERDUE");
    
    // Normalize to USD
    const toUSD = (amount: number, curr: "USD" | "INR" | "EUR") => {
      if (curr === "USD") return amount;
      if (curr === "EUR") return amount * 1.08;
      return amount * 0.012;
    };

    const total = overdue.reduce((sum, i) => sum + toUSD(i.total_amount, i.currency), 0);
    
    setOverdueCount(overdue.length);
    setTotalOverdueUSD(Math.round(total));
  }, []);

  if (overdueCount === 0) return null;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(totalOverdueUSD);

  return (
    <div className="w-full mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <div className="flex items-start space-x-3">
        <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
        <div>
          <h4 className="text-sm font-semibold text-red-300">
            Critical Invoices Overdue — Action Required
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            There are currently <span className="text-red-300 font-medium">{overdueCount}</span> invoices marked as overdue, totaling <span className="text-red-300 font-semibold">{formattedAmount}</span>.
          </p>
        </div>
      </div>
      <Link
        href="/invoices"
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold self-start sm:self-center transition-all group"
      >
        <span>View Overdue Invoices</span>
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
