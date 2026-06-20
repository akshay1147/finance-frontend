"use client";

import React, { useState } from "react";
import { 
  X, 
  Send, 
  Trash2, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Calendar,
  User,
  HelpCircle,
  FileText,
  AlertTriangle
} from "lucide-react";
import { Invoice, updateInvoice, recordPayment, TAX_CODES, Payment } from "@/services/api";
import { useRole } from "@/context/RoleContext";

interface InvoiceDetailPanelProps {
  invoice: Invoice;
  onClose: () => void;
  onUpdate: () => void;
}

export default function InvoiceDetailPanel({ invoice, onClose, onUpdate }: InvoiceDetailPanelProps) {
  const { currentRole, hasPermission } = useRole();
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wire" | "card" | "ach" | "sepa" | "upi">("wire");
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleSendInvoice = () => {
    try {
      updateInvoice(invoice.invoice_id, { status: "SENT", issued_date: new Date().toISOString() });
      onUpdate();
    } catch (err) {
      alert("Error sending invoice");
    }
  };

  const handleCancelInvoice = () => {
    if (confirm("Are you sure you want to void/cancel this invoice?")) {
      try {
        updateInvoice(invoice.invoice_id, { status: "CANCELLED" });
        onUpdate();
      } catch (err) {
        alert("Error cancelling invoice");
      }
    }
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      alert("Reference number / Transaction ID is required");
      return;
    }

    try {
      recordPayment(invoice.invoice_id, {
        payment_method: paymentMethod,
        reference_number: referenceNumber,
      });
      setRecordFormOpen(false);
      setReferenceNumber("");
      onUpdate();
    } catch (err) {
      alert("Error recording payment");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Permission Checks
  const canSend = hasPermission("invoices", "send") && invoice.status === "DRAFT";
  const canCancel = hasPermission("invoices", "cancel") && !["CANCELLED", "PAID"].includes(invoice.status);
  const canRecordPayment = hasPermission("payments", "record") && ["SENT", "VIEWED", "OVERDUE", "PARTIAL", "DISPUTED"].includes(invoice.status);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "OVERDUE": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "SENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DISPUTED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DRAFT": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "CANCELLED": return "bg-zinc-800 text-zinc-500 border-zinc-700/60";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatUSD = (val: number, curr: "USD" | "INR" | "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-[#090d16] border-l border-slate-800/80 h-full flex flex-col shadow-2xl overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-[#060a12]/80 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{invoice.invoice_number}</span>
              <span className={`text-[10px] px-2 py-0.5 font-semibold rounded-full border ${getStatusBadgeClass(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{invoice.account_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-800/40 bg-slate-900/30 flex flex-wrap gap-2.5 items-center">
          {/* Send */}
          {canSend && (
            <button
              onClick={handleSendInvoice}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg shadow-purple-500/10"
            >
              <Send size={13} />
              <span>Send Invoice</span>
            </button>
          )}

          {/* Record Payment */}
          {canRecordPayment && (
            <button
              onClick={() => setRecordFormOpen(!recordFormOpen)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
            >
              <CreditCard size={13} />
              <span>Record Payment</span>
            </button>
          )}

          {/* Print / Download */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/40 rounded-xl transition-all"
          >
            <Printer size={13} />
            <span>Print / PDF</span>
          </button>

          {/* Cancel/Void */}
          {canCancel && (
            <button
              onClick={handleCancelInvoice}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/45 rounded-xl transition-all ml-auto"
            >
              <Trash2 size={13} />
              <span>Void Invoice</span>
            </button>
          )}
        </div>

        {/* Record Payment Inline Form */}
        {recordFormOpen && (
          <div className="bg-[#0b1220] border-b border-slate-800/80 p-5">
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 max-w-md">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <CreditCard size={14} className="text-emerald-400" />
                <span>Record Manual Wire / Transfer</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="glass-input px-2.5 py-1.5 rounded-lg text-xs bg-[#090d16]"
                  >
                    <option value="wire">Bank Wire Transfer</option>
                    <option value="ach">ACH Transfer (US)</option>
                    <option value="sepa">SEPA Direct Debit (EU)</option>
                    <option value="upi">UPI / NetBanking (IN)</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase">Txn / Reference ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FT890-441-2"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="glass-input px-2.5 py-1.5 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setRecordFormOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
                >
                  Confirm Reconciled Receipt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Drawer Body - Split into Information and PDF Preview */}
        <div className="flex-grow p-6 space-y-6">

          {/* Workflow Timeline */}
          <div className="bg-[#050910] border border-slate-800/40 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Payment Timeline & Progress
            </h4>
            <div className="flex items-start justify-between relative pl-4 border-l border-slate-800/80 space-y-4 flex-col">
              {/* Draft */}
              <div className="flex items-center space-x-3.5 relative">
                <div className="absolute -left-[22px] w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20"></div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Invoice Drafted</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(invoice.created_at).toLocaleString()} by {invoice.created_by}
                  </div>
                </div>
              </div>

              {/* Sent */}
              <div className="flex items-center space-x-3.5 relative">
                <div className={`absolute -left-[22px] w-3 h-3 rounded-full ${
                  invoice.status !== "DRAFT"
                    ? "bg-blue-500 ring-4 ring-blue-500/20" 
                    : "bg-slate-800"
                }`}></div>
                <div>
                  <div className={`text-xs font-bold ${invoice.status !== "DRAFT" ? "text-slate-200" : "text-slate-500"}`}>
                    Sent to Client
                  </div>
                  {invoice.status !== "DRAFT" && (
                    <div className="text-[10px] text-slate-500">
                      Email dispatch recorded on {new Date(invoice.issued_date).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Paid / Overdue */}
              <div className="flex items-center space-x-3.5 relative">
                <div className={`absolute -left-[22px] w-3 h-3 rounded-full ${
                  invoice.status === "PAID"
                    ? "bg-emerald-500 ring-4 ring-emerald-500/20" 
                    : invoice.status === "OVERDUE"
                      ? "bg-rose-500 ring-4 ring-rose-500/20"
                      : "bg-slate-800"
                }`}></div>
                <div>
                  <div className={`text-xs font-bold ${
                    invoice.status === "PAID"
                      ? "text-emerald-400"
                      : invoice.status === "OVERDUE"
                        ? "text-rose-400"
                        : "text-slate-500"
                  }`}>
                    {invoice.status === "PAID" ? "Reconciled & Settled" : invoice.status === "OVERDUE" ? "Overdue Balance Alarm" : "Payment Settlement"}
                  </div>
                  {invoice.status === "PAID" && invoice.paid_date && (
                    <div className="text-[10px] text-slate-500">
                      Payment settled on {new Date(invoice.paid_date).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PDF Invoice Document Preview Sheet */}
          <div id="print-area" className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl border border-slate-300 font-sans leading-relaxed text-xs">
            {/* Document Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5">
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-[10px] text-white">LTI</div>
                  <span className="font-bold text-xs tracking-wide">LTI TECHNOLOGIES</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Empowering Learners · Connecting Industries<br />
                  billing@ltitechnologies.com · Bangalore, India
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold text-slate-800 tracking-wider">INVOICE</h2>
                <div className="text-[10px] text-purple-600 font-bold mt-0.5">{invoice.invoice_number}</div>
                <p className="text-[9px] text-slate-500 mt-1">
                  Issued: {new Date(invoice.issued_date).toLocaleDateString()}<br />
                  Due: {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Bill To:</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{invoice.account_name}</div>
                <p className="text-[9px] text-slate-500 leading-normal mt-0.5">
                  Client ID: {invoice.account_id}<br />
                  Payment Terms: {invoice.payment_terms}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Method & Reference:</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {invoice.status === "PAID" ? "Settled Bank Transfer" : "Stripe Online Card Check"}
                </div>
                <p className="text-[9px] text-slate-500 leading-normal mt-0.5">
                  Payment Status: {invoice.status}
                </p>
              </div>
            </div>

            {/* Items table */}
            <table className="w-full text-[10px] mb-6 text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold text-[9px] text-left uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center w-12">Qty</th>
                  <th className="py-2 text-right w-20">Rate</th>
                  <th className="py-2 text-right w-20">Tax</th>
                  <th className="py-2 text-right w-20">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2.5 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2.5 text-center">{item.quantity}</td>
                    <td className="py-2.5 text-right">{formatUSD(item.unit_price, invoice.currency)}</td>
                    <td className="py-2.5 text-right">
                      {formatUSD(item.tax_amount, invoice.currency)}
                      <span className="text-[8px] text-slate-400 block font-normal">({item.tax_code})</span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-800">{formatUSD(item.total, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-56 space-y-2 text-[10px] text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatUSD(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span>{formatUSD(invoice.tax_amount, invoice.currency)}</span>
                </div>
                <div className="border-b border-slate-150 my-1"></div>
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>Grand Total</span>
                  <span className="text-purple-600">{formatUSD(invoice.total_amount, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-[9px] text-slate-400 leading-normal">
              <strong>Terms of Agreement:</strong> All services are provided as per client portal signed contracts. Outbound invoice receipts are generated by automated billing triggers under LTI Technologies Portal 6 guidelines. Payments must be processed through local clearing networks or Stripe card checkout within the specified due dates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
