"use client";

import React, { useEffect, useState } from "react";
import { getPayments, Payment, getInvoices, Invoice, recordPayment } from "@/services/api";
import { useRole } from "@/context/RoleContext";
import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  CreditCard,
  Building,
  RefreshCw,
  Wallet,
  ArrowRight,
  UserCheck
} from "lucide-react";

export default function PaymentsPage() {
  const { currentRole, hasPermission } = useRole();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  // Reconciler Modal Form State
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wire" | "card" | "ach" | "sepa" | "upi">("wire");
  const [referenceNumber, setReferenceNumber] = useState("");

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setPayments(getPayments());
      setInvoices(getInvoices());
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  // Apply filters
  useEffect(() => {
    let result = [...payments];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) => 
          p.invoice_number.toLowerCase().includes(query) || 
          p.account_name.toLowerCase().includes(query) ||
          p.reference_number.toLowerCase().includes(query)
      );
    }

    // Method Filter
    if (methodFilter !== "ALL") {
      result = result.filter((p) => p.payment_method === methodFilter.toLowerCase());
    }

    // Sort by date desc
    result.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

    setFilteredPayments(result);
  }, [payments, search, methodFilter]);

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert("Please select an invoice to reconcile");
      return;
    }
    if (!referenceNumber.trim()) {
      alert("Please enter a clearing transaction reference number");
      return;
    }

    try {
      recordPayment(selectedInvoiceId, {
        payment_method: paymentMethod,
        reference_number: referenceNumber,
      });
      setReconcileOpen(false);
      setSelectedInvoiceId("");
      setReferenceNumber("");
      loadData();
    } catch (err) {
      alert("Failed to reconcile payment");
    }
  };

  // Aggregations
  const totalSettledUSD = payments.reduce((sum, p) => {
    const toUSD = (amt: number, cur: string) => {
      if (cur === "USD") return amt;
      if (cur === "EUR") return amt * 1.08;
      return amt * 0.012;
    };
    return sum + toUSD(p.amount, p.currency);
  }, 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card": return <CreditCard size={14} className="text-purple-400" />;
      case "wire": return <Building size={14} className="text-blue-400" />;
      default: return <Wallet size={14} className="text-slate-400" />;
    }
  };

  // Get active unpaid invoices for manual reconciler
  const unpaidInvoices = invoices.filter((i) => 
    ["SENT", "VIEWED", "OVERDUE", "PARTIAL", "DISPUTED"].includes(i.status)
  );

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const canRecord = hasPermission("payments", "record");

  return (
    <div className="space-y-6">
      {/* Top Ledger Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Settled Collections
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">
            {formatUSD(totalSettledUSD)}
          </h3>
          <p className="text-[10px] text-emerald-400 mt-1">
            Cash cleared in bank accounts
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ledger Transaction Count
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-3">
            {payments.length}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            Reconciled records
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Unreconciled Pipeline
          </div>
          <h3 className="text-2xl font-extrabold text-purple-400 mt-3">
            {unpaidInvoices.length}
          </h3>
          <p className="text-[10px] text-purple-400/80 mt-1">
            Invoices awaiting settlement
          </p>
        </div>
      </div>

      {/* Main Table controls */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by txn ID, client, or invoice..."
            className="glass-input pl-9 pr-4 py-2 w-full rounded-xl text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-900/40 px-2.5 py-1.5 rounded-xl border border-slate-800/60 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Method</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent border-none text-slate-300 focus:outline-none pr-1.5 cursor-pointer text-xs"
            >
              <option value="ALL">All Methods</option>
              <option value="CARD">Credit/Debit Card</option>
              <option value="WIRE">Bank Wire Transfer</option>
              <option value="ACH">ACH Transfer</option>
              <option value="SEPA">SEPA Direct Debit</option>
              <option value="UPI">UPI / NetBanking</option>
            </select>
          </div>

          {/* Quick Manual Record trigger */}
          {canRecord && unpaidInvoices.length > 0 && (
            <button
              onClick={() => setReconcileOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-xs text-white rounded-xl shadow-lg shadow-emerald-500/10 transition-all"
            >
              <Plus size={14} />
              <span>Record Wire Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* Reconcile Modal Form */}
      {reconcileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReconcileOpen(false)}></div>
          
          <form onSubmit={handleReconcileSubmit} className="glass-card w-full max-w-md p-6 rounded-2xl relative z-10 border border-emerald-500/20 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <UserCheck size={20} className="text-emerald-400" />
              <span>Manual Bank Settlement Reconciler</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">
              Record a verified bank receipt and close out the corresponding outstanding invoice. This updates the billing status to PAID instantly.
            </p>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select Outstanding Invoice</label>
              <select
                required
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="glass-input px-3 py-2 rounded-xl text-xs bg-[#090d16]"
              >
                <option value="">-- Choose Invoice to Settle --</option>
                {unpaidInvoices.map((i) => (
                  <option key={i.invoice_id} value={i.invoice_id}>
                    {i.invoice_number} - {i.account_name} ({new Intl.NumberFormat("en-US", { style: "currency", currency: i.currency }).format(i.total_amount)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs bg-[#090d16]"
                >
                  <option value="wire">Bank Wire Transfer</option>
                  <option value="ach">ACH (US)</option>
                  <option value="sepa">SEPA (EU)</option>
                  <option value="upi">UPI (IN)</option>
                  <option value="card">Stripe Payment Link</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Txn / Clearing Ref ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CLEAR-8902B"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800/40 text-xs">
              <button
                type="button"
                onClick={() => setReconcileOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl shadow-lg shadow-emerald-500/10 transition-all"
              >
                Confirm Settlement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction List Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="animate-spin text-purple-500" size={28} />
          <p className="text-slate-400 text-xs">Loading ledger events...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="glass-card py-20 rounded-2xl text-center space-y-3.5 border border-dashed border-slate-800">
          <CheckCircle className="text-slate-600 mx-auto" size={32} />
          <h4 className="text-sm font-bold text-slate-300">No Payments Logged</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No settled transactions match the specified search queries or filter categories.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left finance-table">
              <thead>
                <tr className="bg-slate-900/25">
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Reference Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount Settled</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pay) => (
                  <tr key={pay.payment_id} className="hover:bg-slate-800/10 transition-colors border-b border-slate-800/30">
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(pay.payment_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">
                      {pay.reference_number}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-300">{pay.account_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 font-medium">{pay.invoice_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center space-x-1.5 text-xs text-slate-300 capitalize">
                        {getMethodIcon(pay.payment_method)}
                        <span>{pay.payment_method}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-white">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: pay.currency,
                        maximumFractionDigits: 2
                      }).format(pay.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] px-2 py-0.5 font-bold rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
