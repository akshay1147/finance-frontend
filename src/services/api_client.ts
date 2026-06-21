import {
  createSuccessResponse,
  createErrorResponse,
  generateTraceId,
  type ApiResponse,
} from "@/types/api_response";
import { mockProvider } from "./mock_provider";
import { errorMonitor } from "./error_monitor";
import type { Invoice, Payment, Subscription } from "./types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function withErrorHandling<T>(
  operation: string,
  fn: () => T | Promise<T>
): Promise<ApiResponse<T>> {
  const traceId = generateTraceId();
  try {
    const data = await fn();
    return createSuccessResponse(data, `${operation} completed`, { trace_id: traceId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    errorMonitor.trackApiFailure(operation, message, traceId);
    return createErrorResponse<T>(
      "API_OPERATION_FAILED",
      message,
      "Retry the request or contact support with the trace ID.",
      traceId
    );
  }
}

export const apiClient = {
  isMockMode(): boolean {
    return USE_MOCK;
  },

  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    return withErrorHandling("getInvoices", () => mockProvider.getInvoices());
  },

  async getPayments(): Promise<ApiResponse<Payment[]>> {
    return withErrorHandling("getPayments", () => mockProvider.getPayments());
  },

  async getSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return withErrorHandling("getSubscriptions", () => mockProvider.getSubscriptions());
  },

  async saveInvoice(
    invoice: Omit<Invoice, "invoice_id" | "invoice_number" | "created_at" | "updated_at">
  ): Promise<ApiResponse<Invoice>> {
    return withErrorHandling("saveInvoice", () => mockProvider.saveInvoice(invoice));
  },

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return withErrorHandling("updateInvoice", () => mockProvider.updateInvoice(invoiceId, updates));
  },

  async recordPayment(
    invoiceId: string,
    payment: Omit<
      Payment,
      "payment_id" | "invoice_id" | "invoice_number" | "account_name" | "status" | "currency" | "amount" | "payment_date"
    >
  ): Promise<ApiResponse<Payment>> {
    return withErrorHandling("recordPayment", () => mockProvider.recordPayment(invoiceId, payment));
  },

  async createPaymentIntent(
    invoiceId: string,
    amount: number,
    currency: string
  ): Promise<ApiResponse<{ clientSecret: string }>> {
    const traceId = generateTraceId();
    try {
      const response = await fetch("/api/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount, currency }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        errorMonitor.trackPaymentFailure(invoiceId, payload.message ?? "Intent creation failed", traceId);
        return createErrorResponse<{ clientSecret: string }>(
          "PAYMENT_INTENT_FAILED",
          payload.message ?? "Failed to create payment intent",
          "Verify Stripe configuration and retry payment.",
          traceId
        );
      }

      return createSuccessResponse(payload.data, "Payment intent created", { trace_id: traceId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      errorMonitor.trackPaymentFailure(invoiceId, message, traceId);
      return createErrorResponse<{ clientSecret: string }>(
        "PAYMENT_INTENT_NETWORK",
        message,
        "Check network connectivity and retry.",
        traceId
      );
    }
  },
};
