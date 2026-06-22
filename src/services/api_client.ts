import {
  createSuccessResponse,
  createErrorResponse,
  generateTraceId,
  ApiResponse,
} from "@/types/api_response";
import { mockProvider } from "./mock_provider";
import { errorMonitor } from "./error_monitor";
import { telemetryService } from "@/services/telemetry/telemetry_service";
import type { Invoice, Payment, Subscription } from "./types";

export class ContractValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractValidationError";
  }
}

const BASE_URL = "/api/v1";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    let payload: any;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      if (payload && typeof payload.success === "boolean") {
        telemetryService.trackApiFailure(endpoint, response.status, payload);
        return payload as ApiResponse<T>;
      }
      const errPayload = {
        success: false,
        message: payload?.error || payload?.message || `Request failed with status ${response.status}`,
        errors: payload?.errors || [
          {
            code: `HTTP_${response.status}`,
            message: `Request failed with status ${response.status}`,
          },
        ],
      };
      telemetryService.trackApiFailure(endpoint, response.status, errPayload);
      return errPayload;
    }

    // Strict contract enforcement
    if (!payload || typeof payload.success !== "boolean") {
      const error = new ContractValidationError(`API endpoint ${endpoint} returned a non-contract payload.`);
      telemetryService.trackApiFailure(endpoint, response.status, error.message);
      throw error;
    }

    return payload as ApiResponse<T>;
  } catch (error: any) {
    telemetryService.trackApiFailure(endpoint, 0, error);
    if (error instanceof ContractValidationError) {
      throw error;
    }
    return {
      success: false,
      message: error.message || "Network request failed",
      errors: [
        {
          code: "NETWORK_ERROR",
          message: error.message || "Check network connection and api server status",
        },
      ],
    };
  }
}

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
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

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
