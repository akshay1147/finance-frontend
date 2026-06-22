"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Info,
  ChevronRight,
  X,
  Upload,
  Clock
} from "lucide-react";
import { apiClient } from "@/services/api_client";
import { Expense } from "@/types/expense";
import { createLoadingState, LoadingState } from "@/states/loading";
import { createErrorState, ErrorState } from "@/states/error";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(createLoadingState(true, "Loading expenses..."));
  const [errorState, setErrorState] = useState<ErrorState>(createErrorState(false));

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  // Selected Detail View
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Claim Form State
  const [formEmployee, setFormEmployee] = useState("Prashanth P");
  const [formCategory, setFormCategory] = useState<Expense["category"]>("Equipment");
  const [formAmount, setFormAmount] = useState(150);
  const [formDept, setFormDept] = useState<Expense["department"]>("Engineering");
  const [formNotes, setFormNotes] = useState("");
  const [receiptName, setReceiptName] = useState("");

  async function fetchExpenses() {
    try {
      setLoadingState(createLoadingState(true, "Fetching corporate claims..."));
      setErrorState(createErrorState(false));
      const res = await apiClient.get<Expense[]>("/finance/expenses");
      
      if (!res.success) {
        throw new Error(res.message || "Failed to load expenses list.");
      }

      setExpenses(res.data || []);
      setLoadingState(createLoadingState(false));
    } catch (err: any) {
      setErrorState(createErrorState(
        true,
        err.message || "Could not retrieve expense claims.",
        "EXPENSES_FETCH_ERROR",
        `TR-${Math.floor(100000 + Math.random() * 900000)}`
      ));
      setLoadingState(createLoadingState(false));
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter operations
  useEffect(() => {
    let result = [...expenses];

    if (search.trim() !== "") {
      const term = search.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.employee_name.toLowerCase().includes(term) ||
          exp.notes.toLowerCase().includes(term) ||
          exp.id.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((exp) => exp.status === statusFilter);
    }

    if (categoryFilter !== "All") {
      result = result.filter((exp) => exp.category === categoryFilter);
    }

    if (deptFilter !== "All") {
      result = result.filter((exp) => exp.department === deptFilter);
    }

    setFilteredExpenses(result);
  }, [expenses, search, statusFilter, categoryFilter, deptFilter]);

  // Submit Claim
  async function handleSubmitExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!formEmployee.trim() || !formNotes.trim()) return;

    try {
      setLoadingState(createLoadingState(true, "Registering expense claim..."));
      const res = await apiClient.post<Expense>("/finance/expenses", {
        employee_name: formEmployee,
        category: formCategory,
        amount: formAmount,
        department: formDept,
        notes: formNotes,
        receipt_url: receiptName ? `/cloudinary/receipts/${receiptName}` : undefined
      });

      if (!res.success) throw new Error(res.message || "Failed to register expense claim.");

      setFormNotes("");
      setReceiptName("");
      setIsSubmitModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || "Failed to submit claim.");
      setLoadingState(createLoadingState(false));
    }
  }

  // Verify/Approve Claim
  async function handleApprove(id: string) {
    try {
      setLoadingState(createLoadingState(true, "Authorizing reimbursement..."));
      const res = await apiClient.post<null>("/finance/expenses", { action: "approve", id });
      
      if (!res.success) throw new Error(res.message || "Failed to approve claim.");
      
      if (selectedExpense && selectedExpense.id === id) {
        setSelectedExpense({ ...selectedExpense, status: "Approved" });
      }
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || "Failed to approve claim.");
      setLoadingState(createLoadingState(false));
    }
  }

  // Reject Claim
  async function handleReject(id: string) {
    try {
      setLoadingState(createLoadingState(true, "Recording rejection..."));
      const res = await apiClient.post<null>("/finance/expenses", { action: "reject", id });
      
      if (!res.success) throw new Error(res.message || "Failed to reject claim.");

      if (selectedExpense && selectedExpense.id === id) {
        setSelectedExpense({ ...selectedExpense, status: "Rejected" });
      }
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || "Failed to reject claim.");
      setLoadingState(createLoadingState(false));
    }
  }

  // Aggregated calculations
  const totalClaimValue = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses.filter(e => e.status === "Approved").reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = expenses.filter(e => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Expense Reimbursements</h1>
          <p className="text-xs text-slate-400">Verify staff corporate claims, authorize payments, and view compliance audits.</p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Claim</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Claims Submitted</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">${totalClaimValue.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">All employee submissions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approved Reimbursements</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">${approvedTotal.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Sent to HR Portal payroll</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claims Awaiting Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-amber-400">${pendingTotal.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Awaiting manager validation</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table & Filtering */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            {/* Filter controls */}
            <div className="flex flex-wrap gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search submitter or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Equipment">Equipment</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Training">Training</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* List */}
            {loadingState.isLoading && !expenses.length ? (
              <div className="py-10 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin"></div>
                <span>{loadingState.message || "Loading claims list..."}</span>
              </div>
            ) : errorState.isError ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl space-y-1.5 animate-fade-in shadow-lg">
                <p className="text-xs font-semibold">{errorState.error_message}</p>
                <p className="text-[10px] text-slate-500 font-mono">Code: {errorState.error_code} | Trace: {errorState.trace_id}</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                No expense records match the filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400 text-xs font-semibold">
                      <th className="py-3 pr-2">ID</th>
                      <th className="py-3">Employee</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Date</th>
                      <th className="py-3 text-right">Amount</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp) => (
                      <tr
                        key={exp.id}
                        onClick={() => setSelectedExpense(exp)}
                        className={`border-b border-slate-850 hover:bg-slate-850/30 transition-all duration-150 cursor-pointer ${
                          selectedExpense?.id === exp.id ? "bg-slate-850/40" : ""
                        }`}
                      >
                        <td className="py-3.5 pr-2 text-xs font-semibold text-blue-400">{exp.id}</td>
                        <td className="py-3.5 text-sm font-medium text-slate-200">
                          <div>
                            <p>{exp.employee_name}</p>
                            <p className="text-[10px] text-slate-500">{exp.department}</p>
                          </div>
                        </td>
                        <td className="py-3.5 text-xs text-slate-300">{exp.category}</td>
                        <td className="py-3.5 text-xs text-slate-400">{exp.date}</td>
                        <td className="py-3.5 text-sm font-bold text-slate-200 text-right">
                          ${exp.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              exp.status === "Approved"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : exp.status === "Pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-600 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected Detail Pane */}
        <div className="space-y-6">
          {selectedExpense ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden animate-slide-in">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Expense claim details</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedExpense.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="text-slate-500 hover:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Details list */}
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Submitter:</span>
                    <span className="text-slate-300 font-semibold">{selectedExpense.employee_name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-300 font-semibold">{selectedExpense.department}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-300 font-semibold">{selectedExpense.category}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Claim Date:</span>
                    <span className="text-slate-300 font-semibold">{selectedExpense.date}</span>
                  </div>
                </div>

                {/* Amount Claimed */}
                <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Requested Amount</span>
                    <span className="text-xl font-bold text-white">${selectedExpense.amount.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    USD
                  </span>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                  <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed">
                    {selectedExpense.notes}
                  </div>
                </div>

                {/* Receipt Upload / View */}
                {selectedExpense.receipt_url ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Supporting Document</span>
                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-300 truncate">receipt_document.png</p>
                          <p className="text-[10px] text-slate-500">Uploaded via Cloudinary API</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg">
                        Verified
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>No receipt attachments added to this claim.</span>
                  </div>
                )}

                {/* Approvals */}
                {selectedExpense.status === "Pending" && (
                  <div className="pt-4 border-t border-slate-850 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleApprove(selectedExpense.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Claim</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedExpense.id)}
                      className="bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/40 text-rose-400 font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Claim</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center py-16 space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No Selection</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select an employee claim from the listing to examine purchase receipts, description notes, and manage the approval workflow.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white">Submit Reimbursement Claim</h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-500 hover:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee Name</label>
                  <input
                    type="text"
                    required
                    value={formEmployee}
                    onChange={(e) => setFormEmployee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as Expense["department"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Expense["category"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Travel">Travel</option>
                    <option value="Meals">Meals</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Training">Training</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount Claimed ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the purpose of this expense and detail items purchased..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Attachment (Receipt)</label>
                <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
                  {receiptName ? (
                    <span className="text-xs text-blue-400 font-semibold">{receiptName}</span>
                  ) : (
                    <>
                      <span className="text-xs text-slate-400 block font-medium">Click to select receipt document</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">Supports PNG, JPG, PDF up to 4MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    id="receipt-file-uploader"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setReceiptName(e.target.files[0].name);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("receipt-file-uploader")?.click()}
                    className="mt-2 text-[10px] font-bold text-slate-300 bg-slate-950 border border-slate-850 px-3 py-1 rounded"
                  >
                    Browse Local File
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
