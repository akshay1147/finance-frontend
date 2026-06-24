import { generateTraceId } from "@/types/api_response";

export type ErrorCategory = "api" | "payment" | "render";

export interface MonitoredError {
  trace_id: string;
  category: ErrorCategory;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const MAX_ERRORS = 100;
const errorLog: MonitoredError[] = [];

function record(category: ErrorCategory, message: string, traceId?: string, context?: Record<string, unknown>): void {
  const entry: MonitoredError = {
    trace_id: traceId ?? generateTraceId(),
    category,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  errorLog.unshift(entry);
  if (errorLog.length > MAX_ERRORS) {
    errorLog.pop();
  }

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.error(`[error_monitor:${category}]`, entry);
  }
}

export const errorMonitor = {
  trackApiFailure(operation: string, message: string, traceId?: string): void {
    record("api", message, traceId, { operation });
  },

  trackPaymentFailure(invoiceId: string, message: string, traceId?: string): void {
    record("payment", message, traceId, { invoiceId });
  },

  trackRenderFailure(component: string, message: string, traceId?: string): void {
    record("render", message, traceId, { component });
  },

  getRecentErrors(limit = 20): MonitoredError[] {
    return errorLog.slice(0, limit);
  },

  clear(): void {
    errorLog.length = 0;
  },
};
