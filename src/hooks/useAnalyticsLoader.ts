import { useState, useEffect, useCallback } from "react";
import { queryClient } from "@/services/query_client";
import { AnalyticsPayload } from "@/types/analytics";
import { Expense } from "@/types/expense";
import { LoadingState, createLoadingState } from "@/states/loading";
import { ErrorState, createErrorState } from "@/states/error";
import { getEndpoint } from "@/services/endpoint_registry";
import { telemetryService } from "@/services/telemetry/telemetry_service";

export function useAnalyticsLoader() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPayload | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(createLoadingState(true, "Initializing chart engine..."));
  const [errorState, setErrorState] = useState<ErrorState>(createErrorState(false));
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const loadData = useCallback(async (forceRefresh = false) => {
    const startTime = performance.now();
    try {
      setLoadingState(createLoadingState(true, "Fetching latest analytics streams..."));
      setErrorState(createErrorState(false));

      const [analyticsRes, expensesRes] = await Promise.all([
        queryClient.fetch<AnalyticsPayload>(getEndpoint('v1', 'analytics'), { ttl: 15000, forceRefresh }),
        queryClient.fetch<Expense[]>(getEndpoint('v1', 'expenses'), { ttl: 15000, forceRefresh })
      ]);

      if (!analyticsRes.success) {
        throw new Error(analyticsRes.message || "Failed to retrieve analytics payload.");
      }

      setAnalyticsData(analyticsRes.data || null);
      if (expensesRes.success && expensesRes.data) {
        setExpenses(expensesRes.data);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
      setLoadingState(createLoadingState(false));

      const duration = performance.now() - startTime;
      telemetryService.trackDashboardPerformance("AnalyticsLoad", duration);
    } catch (err: any) {
      telemetryService.trackRenderFailure("AnalyticsWidget", err);
      setErrorState(createErrorState(
        true,
        err.message || "An unexpected error occurred during analytics load.",
        "ANALYTICS_WIDGET_CRASH",
        `TR-${Math.floor(100000 + Math.random() * 900000)}`
      ));
      setLoadingState(createLoadingState(false));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    analyticsData,
    expenses,
    loadingState,
    errorState,
    lastRefreshed,
    refresh: () => loadData(true),
    retry: () => loadData(true)
  };
}
