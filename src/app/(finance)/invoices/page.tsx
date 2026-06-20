"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { getInvoices, Invoice } from "@/services/api";
import { useRole } from "@/context/RoleContext";
import InvoiceBuilder from "@/components/invoices/InvoiceBuilder";
import InvoiceDetailPanel from "@/components/invoices/InvoiceDetailPanel";
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Eye,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function InvoicesPageContent() {
  const { currentRole, hasPermission } = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date" | "number" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const loadInvoices = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const data = getInvoices();
      setInvoices(data);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices, currentRole]);

  // Handle URL Query parameters (e.g. ?action=new to open builder)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new" && hasPermission("invoices", "create")) {
      setShowBuilder(true);
    }
  }, [searchParams, currentRole, hasPermission]);

  // Apply filters, search & sort
  useEffect(() => {
    let result = [...invoices];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (i) => 
          i.invoice_number.toLowerCase().includes(query) || 
          i.account_name.toLowerCase().includes(query)
      );
    }

    // Status Filter
    if (statusFilter !== "ALL") {
      result = result.filter((i) => i.status === statusFilter);
    }

    // Currency Filter
    if (currencyFilter !== "ALL") {
      result = result.filter((i) => i.currency === currencyFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === "number") {
        comparison = a.invoice_number.localeCompare(b.invoice_number);
      } else if (sortBy === "amount") {
        comparison = a.total_amount - b.total_amount;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredInvoices(result);
    setPage(1); // Reset to page 1 on filter
  }, [invoices, search, statusFilter, currencyFilter, sortBy, sortOrder]);

  // Update selected invoice reference if lists reload
  useEffect(() => {
    if (selectedInvoice) {
      const updated = invoices.find((i) => i.invoice_id === selectedInvoice.invoice_id);
      if (updated) {
        setSelectedInvoice(updated);
      }
    }
  }, [invoices, selectedInvoice]);

  const handleSaveInvoice = (_saved: Invoice) => {
    setShowBuilder(false);
    router.replace("/invoices"); // remove action query
    loadInvoices();
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    router.replace("/invoices");
  };

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

  // Pagination slice
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const canCreate = hasPermission("invoices", "create");

  return (
    <div className="space-y-6">
      {showBuilder ? (
        <InvoiceBuilder onSave={handleSaveInvoice} onCancel={handleCancelBuilder} />
      ) : (
        <>
          {/* Controls Bar: Search, Filters, Add New */}
          <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by invoice number or client..."
                className="glass-input pl-9 pr-4 py-2 w-full rounded-xl text-xs"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center space-x-1.5 bg-slate-900/40 px-2.5 py-1.5 rounded-xl border border-slate-800/60 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-slate-300 focus:outline-none pr-1.5 cursor-pointer text-xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="DISPUTED">Disputed</option>
                  <option value="CANCELLED">Voided</option>
                </select>
              </div>

              {/* Currency Filter */}
              <div className="flex items-center space-x-1.5 bg-slate-900/40 px-2.5 py-1.5 rounded-xl border border-slate-800/60 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Currency</span>
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="bg-transparent border-none text-slate-300 focus:outline-none pr-1.5 cursor-pointer text-xs"
                >
                  <option value="ALL">All Currencies</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-1.5 bg-slate-900/40 px-2.5 py-1.5 rounded-xl border border-slate-800/60 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "number" | "amount")}
                  className="bg-transparent border-none text-slate-300 focus:outline-none pr-1.5 cursor-pointer text-xs"
                >
                  <option value="date">Created Date</option>
                  <option value="number">Invoice Number</option>
                  <option value="amount">Amount</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="text-slate-500 hover:text-slate-300 font-bold uppercase text-[9px] border-l border-slate-800 pl-1.5"
                >
                  {sortOrder}
                </button>
              </div>

              {/* Add New Button */}
              {canCreate && (
                <button
                  onClick={() => setShowBuilder(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 font-bold text-xs text-white rounded-xl shadow-lg shadow-purple-500/10 transition-all ml-auto md:ml-0"
                >
                  <Plus size={14} />
                  <span>Create Invoice</span>
                </button>
              )}
            </div>
          </div>

          {/* Invoices List Display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="animate-spin text-purple-500" size={28} />
              <p className="text-slate-400 text-xs">Fetching invoices ledger...</p>
            </div>
          ) : paginatedInvoices.length === 0 ? (
            <div className="glass-card py-20 rounded-2xl text-center space-y-3.5 border border-dashed border-slate-800">
              <SlidersHorizontal className="text-slate-600 mx-auto" size={32} />
              <h4 className="text-sm font-bold text-slate-300">No Invoices Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No invoices match the specified filters. Reset filters or create a new invoice draft using the creation shortcuts.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left finance-table">
                  <thead>
                    <tr className="bg-slate-900/25">
                      <th className="px-6 py-4">Invoice Number</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoices.map((inv) => (
                      <tr 
                        key={inv.invoice_id}
                        className="hover:bg-slate-800/10 transition-colors border-b border-slate-800/30 cursor-pointer"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <td className="px-6 py-4 font-bold text-slate-200">
                          {inv.invoice_number}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-300">{inv.account_name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{inv.account_id}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(inv.issued_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(inv.due_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-slate-200">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: inv.currency,
                            maximumFractionDigits: 2
                          }).format(inv.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 font-semibold rounded-full border ${getStatusBadgeClass(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 rounded-lg transition-all"
                              title="View Invoice Panel"
                            >
                              <Eye size={13} />
                            </button>
                            {["SENT", "VIEWED", "OVERDUE"].includes(inv.status) && (
                              <Link
                                href={`/billing/pay?invoice=${inv.invoice_number}`}
                                className="p-1.5 text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all"
                                title="Open Client Payment Checkout"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/10 border-t border-slate-800/40 text-xs text-slate-400">
                  <div>
                    Showing <span className="font-semibold text-slate-200">{(page - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-semibold text-slate-200">
                      {Math.min(page * itemsPerPage, filteredInvoices.length)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-200">{filteredInvoices.length}</span> invoices
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900/40 transition-all text-slate-300"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[11px] font-medium text-slate-300">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900/40 transition-all text-slate-300"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoice Slide-Over Detail Drawer Panel */}
          {selectedInvoice && (
            <InvoiceDetailPanel
              invoice={selectedInvoice}
              onClose={() => setSelectedInvoice(null)}
              onUpdate={loadInvoices}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="animate-spin text-purple-500" size={28} />
        <p className="text-slate-400 text-xs">Fetching invoices ledger...</p>
      </div>
    }>
      <InvoicesPageContent />
    </Suspense>
  );
}
