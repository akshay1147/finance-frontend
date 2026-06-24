import { describe, it, expect, beforeEach } from "vitest";
import { mockProvider } from "@/services/mock_provider";
import { computeFinanceMetrics, computeARAgingMetrics, toUSD } from "@/services/finance_transformer";
import { invoiceService } from "@/services/invoice_service";
import { createSuccessResponse, createErrorResponse } from "@/types/api_response";

describe("Dashboard Integration", () => {
  it("computes finance metrics from seed data", () => {
    const invoices = mockProvider.getInvoices();
    const payments = mockProvider.getPayments();
    const subscriptions = mockProvider.getSubscriptions();

    const metrics = computeFinanceMetrics(invoices, payments, subscriptions);

    expect(metrics.totalRevenueUSD).toBeGreaterThan(0);
    expect(metrics.activeInvoicesCount).toBeGreaterThan(0);
    expect(metrics.collectionRate).toBeGreaterThanOrEqual(0);
    expect(metrics.collectionRate).toBeLessThanOrEqual(100);
    expect(metrics.mrrUSD).toBeGreaterThan(0);
  });

  it("computes AR aging buckets", () => {
    const buckets = computeARAgingMetrics(mockProvider.getInvoices());
    expect(buckets).toHaveLength(4);
    buckets.forEach((b) => {
      expect(b.name).toBeTruthy();
      expect(b.amount).toBeGreaterThanOrEqual(0);
    });
  });

  it("converts currencies to USD correctly", () => {
    expect(toUSD(100, "USD")).toBe(100);
    expect(toUSD(100, "EUR")).toBeCloseTo(108);
    expect(toUSD(100, "INR")).toBeCloseTo(1.2);
  });
});

describe("Invoice Integration", () => {
  it("finds invoice by number", () => {
    const found = invoiceService.findByNumberSync("LTI-INV-2026-00101");
    expect(found).not.toBeNull();
    expect(found?.account_name).toBe("Microsoft Corp");
  });

  it("returns null for unknown invoice number", () => {
    expect(invoiceService.findByNumberSync("INVALID-INV")).toBeNull();
  });

  it("returns recent invoices sorted by date", () => {
    const recent = invoiceService.getRecentInvoices(3);
    expect(recent).toHaveLength(3);
    for (let i = 1; i < recent.length; i++) {
      const prev = new Date(recent[i - 1].created_at).getTime();
      const curr = new Date(recent[i].created_at).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it("lists unpaid invoices", () => {
    const unpaid = invoiceService.getUnpaidInvoices();
    expect(unpaid.length).toBeGreaterThan(0);
    unpaid.forEach((inv) => {
      expect(["SENT", "VIEWED", "OVERDUE", "PARTIAL", "DISPUTED"]).toContain(inv.status);
    });
  });
});

describe("Payment Integration", () => {
  beforeEach(() => {
    const invoices = mockProvider.getInvoices();
    const testInvoice = invoices.find((i) => i.invoice_number === "LTI-INV-2026-00104");
    if (testInvoice && testInvoice.status === "PAID") {
      mockProvider.updateInvoice(testInvoice.invoice_id, { status: "SENT", paid_date: undefined });
    }
  });

  it("records payment and marks invoice as PAID", () => {
    const invoice = mockProvider.getInvoices().find((i) => i.invoice_number === "LTI-INV-2026-00104");
    expect(invoice).toBeDefined();
    if (!invoice) return;

    const payment = mockProvider.recordPayment(invoice.invoice_id, {
      payment_method: "card",
      reference_number: "ch_test_integration",
      stripe_payment_id: "ch_test_integration",
    });

    expect(payment.status).toBe("succeeded");
    expect(payment.stripe_payment_id).toBe("ch_test_integration");

    const updated = mockProvider.getInvoices().find((i) => i.invoice_id === invoice.invoice_id);
    expect(updated?.status).toBe("PAID");
    expect(updated?.paid_date).toBeTruthy();
  });
});

describe("API Response Envelope", () => {
  it("creates success response with expected shape", () => {
    const response = createSuccessResponse({ id: 1 }, "OK", { page: 1 });
    expect(response.success).toBe(true);
    expect(response.message).toBe("OK");
    expect(response.data).toEqual({ id: 1 });
    expect(response.metadata).toEqual({ page: 1 });
    expect(response.errors).toBeUndefined();
  });

  it("creates error response with traceable schema", () => {
    const response = createErrorResponse("TEST_ERROR", "Something failed", "Retry later", "trc_test123");
    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
    expect(response.errors).toHaveLength(1);
    expect(response.errors?.[0].trace_id).toBe("trc_test123");
    expect(response.errors?.[0].error_code).toBe("TEST_ERROR");
    expect(response.errors?.[0].remediation).toBe("Retry later");
  });
});

describe("Finance Guard", () => {
  it("defines route permissions for finance paths", async () => {
    const { FINANCE_ROUTES, ROUTE_PERMISSIONS } = await import("@/middleware/finance_guard");
    expect(FINANCE_ROUTES).toContain("/dashboard");
    expect(FINANCE_ROUTES).toContain("/invoices");
    expect(FINANCE_ROUTES).toContain("/payments");
    expect(ROUTE_PERMISSIONS["/dashboard"]).toEqual({ module: "invoices", action: "read" });
  });
});
