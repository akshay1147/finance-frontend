"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronRight,
  Info,
  DollarSign
} from "lucide-react";
import { apiClient } from "@/services/api_client";
import { Subscription } from "@/types/subscription";
import { createLoadingState, LoadingState } from "@/states/loading";
import { createErrorState, ErrorState } from "@/states/error";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(createLoadingState(true, "Loading subscriptions..."));
  const [errorState, setErrorState] = useState<ErrorState>(createErrorState(false));

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // Selected Subscription Detail View
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [newCustomer, setNewCustomer] = useState("");
  const [newPlan, setNewPlan] = useState<"Starter" | "Professional" | "Enterprise" | "Custom">("Starter");
  const [newAmount, setNewAmount] = useState(1200);
  const [newCycle, setNewCycle] = useState<"Monthly" | "Quarterly" | "Annual">("Monthly");
  const [newTerms, setNewTerms] = useState("Net-30");

  async function fetchSubscriptions() {
    try {
      setLoadingState(createLoadingState(true, "Fetching subscription plans..."));
      setErrorState(createErrorState(false));
      const res = await apiClient.get<Subscription[]>("/finance/subscriptions");
      
      if (!res.success) {
        throw new Error(res.message || "Failed to load subscriptions from API.");
      }
      
      setSubscriptions(res.data || []);
      setLoadingState(createLoadingState(false));
    } catch (err: any) {
      setErrorState(createErrorState(
        true,
        err.message || "Could not retrieve subscription profiles.",
        "SUBSCRIPTIONS_FETCH_ERROR",
        `TR-${Math.floor(100000 + Math.random() * 900000)}`
      ));
      setLoadingState(createLoadingState(false));
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...subscriptions];

    if (search.trim() !== "") {
      const term = search.toLowerCase();
      result = result.filter(
        (sub) =>
          sub.customer_name.toLowerCase().includes(term) ||
          sub.id.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((sub) => sub.status === statusFilter);
    }

    if (planFilter !== "All") {
      result = result.filter((sub) => sub.plan === planFilter);
    }

    setFilteredSubs(result);
  }, [subscriptions, search, statusFilter, planFilter]);

  // Create Subscription Workflow
  async function handleCreateSubscription(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustomer.trim()) return;

    try {
      setLoadingState(createLoadingState(true, "Registering new subscription contract..."));
      const res = await apiClient.post<Subscription>("/finance/subscriptions", {
        customer_name: newCustomer,
        plan: newPlan,
        amount: newAmount,
        billing_cycle: newCycle,
        payment_terms: newTerms,
        currency: "USD"
      });

      if (!res.success) throw new Error(res.message || "Failed to create subscription.");

      // Reset & Refresh
      setNewCustomer("");
      setNewPlan("Starter");
      setNewAmount(1200);
      setNewCycle("Monthly");
      setNewTerms("Net-30");
      setIsCreateModalOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.message || "Could not complete registration.");
      setLoadingState(createLoadingState(false));
    }
  }

  // Update Status Workflow (Cancel/Renew/Suspend)
  async function handleUpdateStatus(id: string, newStatus: Subscription["status"]) {
    try {
      setLoadingState(createLoadingState(true, "Updating contract status..."));
      const res = await apiClient.post<null>("/finance/subscriptions", {
        action: "update-status",
        id,
        status: newStatus
      });

      if (!res.success) throw new Error(res.message || "Failed to update subscription status.");
      
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub({ ...selectedSub, status: newStatus });
      }
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.message || "Failed to edit status.");
      setLoadingState(createLoadingState(false));
    }
  }

  // Aggregated Stats
  const activeRevenue = subscriptions
    .filter(s => s.status === "Active")
    .reduce((sum, s) => sum + s.amount, 0);

  const activeCount = subscriptions.filter(s => s.status === "Active").length;
  const expiringCount = subscriptions.filter(s => s.status === "Expiring").length;
  const expiredCount = subscriptions.filter(s => s.status === "Expired").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <p className="text-xs text-slate-400">Track recurring accounts, manage renewal periods, and configure pricing plans.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">${activeRevenue.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">From active contracts</p>
        </div>

        {/* Card 2: Active */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Plans</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{activeCount}</h3>
          <p className="text-xs text-slate-500 mt-1">Paying subscribers</p>
        </div>

        {/* Card 3: Expiring */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expiring Contracts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{expiringCount}</h3>
          <p className="text-xs text-slate-500 mt-1">Renewing within 30 days</p>
        </div>

        {/* Card 4: Suspended / Expired */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expired / Suspended</span>
            <RefreshCw className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{expiredCount}</h3>
          <p className="text-xs text-slate-500 mt-1">Awaiting client payment</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table & Filtering */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search client name or sub ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Expiring">Expiring</option>
                  <option value="Expired">Expired</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Plans</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            {/* List */}
            {loadingState.isLoading && !subscriptions.length ? (
              <div className="py-10 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin"></div>
                <span>{loadingState.message || "Loading contracts..."}</span>
              </div>
            ) : errorState.isError ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl space-y-1.5">
                <p className="text-xs font-semibold">{errorState.error_message}</p>
                <p className="text-[10px] text-slate-500 font-mono">Code: {errorState.error_code} | Trace: {errorState.trace_id}</p>
              </div>
            ) : filteredSubs.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                No subscriptions matching the specified filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400 text-xs font-semibold">
                      <th className="py-3 pr-2">ID</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Plan</th>
                      <th className="py-3">Renewal</th>
                      <th className="py-3 text-right">Value</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.map((sub) => (
                      <tr
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className={`border-b border-slate-850 hover:bg-slate-850/30 transition-all duration-150 cursor-pointer ${
                          selectedSub?.id === sub.id ? "bg-slate-850/40" : ""
                        }`}
                      >
                        <td className="py-3.5 pr-2 text-xs font-semibold text-blue-400">{sub.id}</td>
                        <td className="py-3.5 text-sm font-medium text-slate-200">{sub.customer_name}</td>
                        <td className="py-3.5 text-xs text-slate-300">{sub.plan}</td>
                        <td className="py-3.5 text-xs text-slate-400">{sub.renewal_date}</td>
                        <td className="py-3.5 text-sm font-bold text-slate-200 text-right">
                          ${sub.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              sub.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : sub.status === "Expiring"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : sub.status === "Expired"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}
                          >
                            {sub.status}
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

        {/* Detailed Pane */}
        <div className="space-y-6">
          {selectedSub ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden animate-slide-in">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Subscription Card</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedSub.customer_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-slate-500 hover:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* General Info */}
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Subscription ID:</span>
                    <span className="text-slate-300 font-semibold">{selectedSub.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Linked Invoice:</span>
                    <span className="text-slate-300 font-semibold">{selectedSub.invoice_number}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Service Plan:</span>
                    <span className="text-slate-300 font-semibold">{selectedSub.plan}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Billing Interval:</span>
                    <span className="text-slate-300 font-semibold">{selectedSub.billing_cycle}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Payment Terms:</span>
                    <span className="text-slate-300 font-semibold">{selectedSub.payment_terms}</span>
                  </div>
                </div>

                {/* Amount Widget */}
                <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Contract Value</span>
                    <span className="text-xl font-bold text-white">${selectedSub.amount.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-1 rounded">
                    USD
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Contract Timeline</span>
                  </h4>
                  <div className="border-l-2 border-slate-800 pl-4 space-y-4 text-xs">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border border-slate-900"></div>
                      <p className="font-semibold text-slate-300">Contract Activated</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Initial activation generated on signoff.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900"></div>
                      <p className="font-semibold text-slate-300">Renewal Cycle Period</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Next renewal scheduled on: {selectedSub.renewal_date}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-850 grid grid-cols-2 gap-3">
                  {selectedSub.status !== "Active" ? (
                    <button
                      onClick={() => handleUpdateStatus(selectedSub.id, "Active")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      Renew / Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(selectedSub.id, "Suspended")}
                      className="bg-amber-600/20 hover:bg-amber-600/35 border border-amber-600/30 text-amber-400 font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                    >
                      Suspend Plan
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleUpdateStatus(selectedSub.id, "Expired")}
                    className="bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/40 text-rose-400 font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                  >
                    Cancel Contract
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center py-16 space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No Selection</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select a client subscription from the list to view billing particulars, renewal timelines, and management workflows.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white">Create New Subscription</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-500 hover:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client / Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wayne Enterprises"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Plan</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as Subscription["plan"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billing Interval</label>
                  <select
                    value={newCycle}
                    onChange={(e) => setNewCycle(e.target.value as Subscription["billing_cycle"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Amount ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Terms</label>
                  <select
                    value={newTerms}
                    onChange={(e) => setNewTerms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net-30">Net-30</option>
                    <option value="Net-60">Net-60</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
