"use client";

import { useCallback, useEffect, useState } from "react";
import { queryClient } from "@/services/query_client";
import { apiClient } from "@/services/api_client";
import { invoiceService } from "@/services/invoice_service";
import { computeFinanceMetrics } from "@/services/finance_transformer";
import type { Invoice } from "@/services/types";
import type { FinanceMetrics } from "@/services/finance_transformer";

interface DashboardData {
  metrics: FinanceMetrics;
  recentInvoices: Invoice[];
}

interface UseDashboardLoaderResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardLoader(roleKey: string): UseDashboardLoaderResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [invoicesRes, paymentsRes, subsRes] = await Promise.all([
        queryClient.fetch(`invoices:${roleKey}`, () => apiClient.getInvoices()),
        queryClient.fetch(`payments:${roleKey}`, () => apiClient.getPayments()),
        queryClient.fetch(`subscriptions:${roleKey}`, () => apiClient.getSubscriptions()),
      ]);

      if (!invoicesRes.success) {
        setError(invoicesRes.message);
        setLoading(false);
        return;
      }

      const metrics = computeFinanceMetrics(
        invoicesRes.data ?? [],
        paymentsRes.data ?? [],
        subsRes.data ?? []
      );

      setData({
        metrics,
        recentInvoices: invoiceService.getRecentInvoices(4),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [roleKey]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    queryClient.invalidate("invoices");
    queryClient.invalidate("payments");
    queryClient.invalidate("subscriptions");
    load();
  }, [load]);

  return { data, loading, error, refresh };
}
