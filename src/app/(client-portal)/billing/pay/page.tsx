"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { getInvoices, Invoice } from "@/services/api";
import StripePaymentForm from "@/components/payments/StripePaymentForm";
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  ChevronLeft, 
  ArrowRight,
  CreditCard,
  RefreshCw
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function ClientPayPageContent() {
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [successTxn, setSuccessTxn] = useState<string | null>(null);
  const [lookupQuery, setLookupQuery] = useState("");

  const loadInvoiceFromParams = useCallback(() => {
    setLoading(true);
    const invNum = searchParams.get("invoice");
    if (invNum) {
      const invoices = getInvoices();
      const found = invoices.find(
        (i) => i.invoice_number.toLowerCase() === invNum.toLowerCase()
      );
      setInvoice(found || null);
    } else {
      setInvoice(null);
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    loadInvoiceFromParams();
  }, [loadInvoiceFromParams]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    
    // Redirect to include the query param
    window.location.search = `?invoice=${lookupQuery.trim()}`;
  };

  const handleSuccess = (txnId: string) => {
    setSuccessTxn(txnId);
  };

  const formatUSD = (val: number, curr: "USD" | "INR" | "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6">
        <RefreshCwSpinner />
      </div>
    );
  }

  // Payment Success Screen
  if (successTxn && invoice) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-emerald-500/20 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full"></div>
          
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Invoice Settlement Completed</h2>
            <p className="text-xs text-slate-400">
              Your payment has been cleared and reconciled directly with Stripe.
            </p>
          </div>

          <div className="bg-[#080d16] border border-slate-800/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Reference</span>
              <span className="font-semibold text-slate-300">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Settled</span>
              <span className="font-extrabold text-white">{formatUSD(invoice.total_amount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stripe Transaction ID</span>
              <span className="font-mono text-purple-400 font-medium">{successTxn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Settlement Date</span>
              <span className="text-slate-300">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 text-xs">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/40 rounded-xl transition-all font-semibold"
            >
              <Printer size={13} />
              <span>Print Receipt</span>
            </button>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-semibold shadow-lg shadow-purple-500/10"
            >
              <span>Back to Portal</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invoice Lookup Screen (if no invoice provided or not found)
  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-sm text-white">
              LTI
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Client Payment Checkout
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-200">Lookup Invoice Balance</h3>
            <p className="text-xs text-slate-400">
              Input the LTI invoice reference number from your billing statement to retrieve card processing details.
            </p>
          </div>

          <form onSubmit={handleLookupSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Invoice Number</label>
              <input
                type="text"
                required
                placeholder="e.g. LTI-INV-2026-00101"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="glass-input px-3 py-2 rounded-xl text-xs uppercase"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
            >
              <span>Retrieve Invoice Details</span>
              <ArrowRight size={13} />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/60 text-center">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-300 flex items-center justify-center space-x-1">
              <ChevronLeft size={14} />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invoice is paid warning screen
  if (invoice.status === "PAID") {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-slate-800 text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Invoice Already Settled</h3>
            <p className="text-xs text-slate-400">
              Invoice <span className="font-semibold text-slate-300">{invoice.invoice_number}</span> was settled and reconciled. No further payment action is required.
            </p>
          </div>
          <div className="bg-[#080d16] border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 text-left">
            Settlement status: <span className="text-emerald-400 font-semibold uppercase">{invoice.status}</span><br />
            Total settled amount: <span className="text-slate-200 font-bold">{formatUSD(invoice.total_amount, invoice.currency)}</span>
          </div>
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between">
      {/* Checkout Navbar */}
      <header className="px-6 py-4 bg-[#070b13] border-b border-slate-800/60 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-sm text-white">
              LTI
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Client Checkout Portal
            </span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-medium">
            <Lock size={12} className="text-emerald-500" />
            <span>Secure 256-bit SSL Gateway</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Split */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Invoice Details & Items Summary (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <div className="flex justify-between items-start border-b border-slate-800/60 pb-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Paying Invoice</div>
                  <h2 className="text-base font-bold text-white mt-1">{invoice.invoice_number}</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Due {new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Due</div>
                  <div className="text-xl font-extrabold text-purple-400 mt-1">
                    {formatUSD(invoice.total_amount, invoice.currency)}
                  </div>
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 px-0.5 uppercase tracking-wide">Services Rendered</div>
                <div className="space-y-2">
                  {invoice.line_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/20 border border-slate-900 text-xs">
                      <div>
                        <div className="font-semibold text-slate-300">{item.description}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Qty {item.quantity} × {formatUSD(item.unit_price, invoice.currency)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-200">{formatUSD(item.total, invoice.currency)}</div>
                        <div className="text-[9px] text-slate-500 font-medium">Includes {item.tax_code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Summary Block */}
              <div className="border-t border-slate-800/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatUSD(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax Calculated</span>
                  <span>{formatUSD(invoice.tax_amount, invoice.currency)}</span>
                </div>
                <div className="border-t border-slate-800/40 my-1"></div>
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>Total Amount Due</span>
                  <span className="text-purple-400">{formatUSD(invoice.total_amount, invoice.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Secure Payment Form Container (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-purple-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <CreditCard size={100} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800/60 pb-3">
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <h3 className="text-sm font-bold text-white">Secure Card Checkout</h3>
                </div>

                <p className="text-xs text-slate-400 leading-normal">
                  All credit and debit card operations are handled securely in compliance with the **PCI-DSS Level 1** industry standard. Card parameters do not touch our backend.
                </p>

                {/* SECURE STRIPE ELEMENT INTEGRATION */}
                <StripePaymentForm 
                  invoice={invoice} 
                  onSuccess={handleSuccess} 
                />

                <div className="flex items-center justify-center space-x-1.5 pt-2 text-[10px] text-slate-500">
                  <Lock size={10} />
                  <span>Encrypted Stripe Elements Iframe Processing</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 bg-[#070b13] border-t border-slate-800/60 text-center text-[10px] text-slate-500 leading-relaxed">
        LTI Technologies Portal 6 is PCI-DSS Level 1 Compliant. Stripe is a registered trademark of Stripe, Inc. and Razorpay of Razorpay Software Private Ltd. For customer support, contact support.stripe.com.
      </footer>
    </div>
  );
}

function RefreshCwSpinner() {
  return (
    <div className="flex flex-col items-center space-y-3">
      <RefreshCw className="animate-spin text-purple-500" size={28} />
      <span className="text-xs text-slate-400">Loading secure elements...</span>
    </div>
  );
}

export default function ClientPayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6"><RefreshCwSpinner /></div>}>
      <ClientPayPageContent />
    </Suspense>
  );
}
