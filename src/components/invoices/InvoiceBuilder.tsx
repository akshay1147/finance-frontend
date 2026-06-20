"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Calculator, ShieldAlert } from "lucide-react";
import { TAX_CODES, saveInvoice, LineItem, Invoice } from "@/services/api";

interface InvoiceBuilderProps {
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export default function InvoiceBuilder({ onSave, onCancel }: InvoiceBuilderProps) {
  const [accountName, setAccountName] = useState("");
  const [currency, setCurrency] = useState<"USD" | "INR" | "EUR">("USD");
  const [paymentTerms, setPaymentTerms] = useState<"Net-30" | "Net-60" | "Immediate">("Net-30");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, tax_code: "ZERO_RATE", tax_amount: 0, total: 0 }
  ]);

  // Calculate default due date on load based on payment terms
  useEffect(() => {
    const today = new Date();
    let days = 30;
    if (paymentTerms === "Net-60") days = 60;
    if (paymentTerms === "Immediate") days = 0;
    
    today.setDate(today.getDate() + days);
    setDueDate(today.toISOString().split("T")[0]);
  }, [paymentTerms]);

  // Recalculate line total when item fields change
  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    const items = [...lineItems];
    const item = { ...items[index] };

    if (field === "description") {
      item.description = val;
    } else if (field === "quantity") {
      item.quantity = Math.max(1, parseInt(val) || 1);
    } else if (field === "unit_price") {
      item.unit_price = Math.max(0, parseFloat(val) || 0);
    } else if (field === "tax_code") {
      item.tax_code = val;
    }

    // Calculate line tax and total
    const subtotal = item.quantity * item.unit_price;
    const selectedTax = TAX_CODES.find((t) => t.code === item.tax_code) || TAX_CODES[6]; // default to zero-rate
    item.tax_amount = parseFloat((subtotal * selectedTax.rate).toFixed(2));
    item.total = parseFloat((subtotal + item.tax_amount).toFixed(2));

    items[index] = item;
    setLineItems(items);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unit_price: 0, tax_code: "ZERO_RATE", tax_amount: 0, total: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Summaries
  const subtotalSum = parseFloat(
    lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)
  );
  
  const taxSum = parseFloat(
    lineItems.reduce((sum, item) => sum + item.tax_amount, 0).toFixed(2)
  );

  const grandTotal = parseFloat((subtotalSum + taxSum).toFixed(2));

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      alert("Client name is required");
      return;
    }

    if (lineItems.some((item) => !item.description.trim())) {
      alert("Please fill description for all line items");
      return;
    }

    const payload = {
      account_id: `acc-${accountName.toLowerCase().replace(/\s+/g, "-")}`,
      account_name: accountName,
      line_items: lineItems,
      subtotal: subtotalSum,
      tax_amount: taxSum,
      total_amount: grandTotal,
      currency,
      due_date: new Date(dueDate).toISOString(),
      status: "DRAFT" as const,
      payment_terms: paymentTerms,
      issued_date: new Date().toISOString(),
      created_by: "staff-lead-jaya"
    };

    try {
      const saved = saveInvoice(payload);
      onSave(saved);
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice");
    }
  };

  return (
    <form onSubmit={handleSaveDraft} className="glass-card p-6 rounded-2xl border border-purple-500/20 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <Calculator className="text-purple-400" size={20} />
          <h2 className="text-base font-bold text-white">Create New Draft Invoice</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Basic Meta Settings */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Client / Customer Name</label>
          <input
            type="text"
            required
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g. Google LLC"
            className="glass-input px-3.5 py-2 rounded-xl text-sm"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Billing Currency</label>
          <select
            value={currency}
            onChange={(e: any) => setCurrency(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl text-sm bg-[#090d16]"
          >
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Payment Terms</label>
          <select
            value={paymentTerms}
            onChange={(e: any) => setPaymentTerms(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl text-sm bg-[#090d16]"
          >
            <option value="Net-30">Net 30</option>
            <option value="Net-60">Net 60</option>
            <option value="Immediate">Immediate</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Due Date</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl text-sm"
          />
        </div>
        <div className="md:col-span-3 flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Internal Billing Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal remarks about this customer or invoice (optional)..."
            className="glass-input px-3 py-2 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Line Items Editor */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 px-1">Invoice Line Items</div>

        <div className="space-y-3.5">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-950/20 p-4 rounded-xl border border-slate-800/40">
              <div className="col-span-12 md:col-span-5 flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase">Description</label>
                <input
                  type="text"
                  required
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  placeholder="Service / Product line item details"
                  className="glass-input px-2.5 py-1.5 rounded-lg text-xs"
                />
              </div>

              <div className="col-span-4 md:col-span-1.5 flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase">Qty</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  className="glass-input px-2 py-1.5 rounded-lg text-xs text-center"
                />
              </div>

              <div className="col-span-8 md:col-span-2 flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase">Rate ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={item.unit_price || ""}
                  onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                  placeholder="0.00"
                  className="glass-input px-2.5 py-1.5 rounded-lg text-xs text-right"
                />
              </div>

              <div className="col-span-8 md:col-span-2 flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase">Tax Jurisdiction</label>
                <select
                  value={item.tax_code}
                  onChange={(e) => handleItemChange(index, "tax_code", e.target.value)}
                  className="glass-input px-2 py-1.5 rounded-lg text-[10px] bg-[#090d16]"
                >
                  {TAX_CODES.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.jurisdiction} ({Math.round(t.rate * 100)}% - {t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-4 md:col-span-1.5 flex flex-col justify-end items-end space-y-1 px-1">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Line Total</div>
                <div className="text-xs font-bold text-slate-200 py-2.5">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(item.total)}
                </div>
              </div>

              {lineItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="col-span-12 md:col-span-1 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center justify-center border border-transparent hover:border-rose-500/20 transition-all self-end md:mb-0.5"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLineItem}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-600/5 hover:bg-purple-600/10 border border-purple-500/20 rounded-xl transition-all"
        >
          <Plus size={14} />
          <span>Add Line Item</span>
        </button>
      </div>

      {/* Tax engine summary & Action footer */}
      <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between pt-4 border-t border-slate-800/60 gap-6">
        {/* Compliance Notice */}
        <div className="flex items-start space-x-2.5 max-w-sm">
          <ShieldAlert className="text-purple-400/70 mt-0.5 flex-shrink-0" size={16} />
          <p className="text-[10px] text-slate-500 leading-normal">
            Tax engine compiles client jurisdiction parameters automatically. The Finance Department is scheduled to reconcile draft invoices before final email delivery is initialized.
          </p>
        </div>

        {/* Totals Box */}
        <div className="bg-[#080d16] border border-slate-800/80 rounded-2xl p-4 w-full md:w-80 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal</span>
            <span className="font-medium text-slate-200">
              {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(subtotalSum)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tax Calculated</span>
            <span className="font-medium text-slate-200">
              {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(taxSum)}
            </span>
          </div>
          <div className="border-t border-slate-800/60 my-1"></div>
          <div className="flex justify-between text-sm font-bold text-white">
            <span>Grand Total</span>
            <span className="text-purple-400">
              {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/40">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center space-x-1.5 px-4.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 rounded-xl transition-all shadow-lg shadow-purple-500/10"
        >
          <Save size={14} />
          <span>Save Invoice Draft</span>
        </button>
      </div>
    </form>
  );
}
