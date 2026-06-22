import { mockProvider } from "./mock_provider";
import { apiClient } from "./api_client";
import type { Invoice } from "./types";
import type { ApiResponse } from "@/types/api_response";

export const invoiceService = {
  async getAll(): Promise<ApiResponse<Invoice[]>> {
    return apiClient.getInvoices();
  },

  async findByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const normalized = invoiceNumber.trim().toLowerCase();
    if (!normalized) return null;

    const response = await apiClient.getInvoices();
    if (!response.success || !response.data) return null;

    return (
      response.data.find((i) => i.invoice_number.toLowerCase() === normalized) ?? null
    );
  },

  findByNumberSync(invoiceNumber: string): Invoice | null {
    const normalized = invoiceNumber.trim().toLowerCase();
    if (!normalized) return null;

    const invoices = mockProvider.getInvoices();
    return invoices.find((i) => i.invoice_number.toLowerCase() === normalized) ?? null;
  },

  async findById(invoiceId: string): Promise<Invoice | null> {
    const response = await apiClient.getInvoices();
    if (!response.success || !response.data) return null;
    return response.data.find((i) => i.invoice_id === invoiceId) ?? null;
  },

  getRecentInvoices(limit = 4): Invoice[] {
    const invoices = mockProvider.getInvoices();
    return [...invoices]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  getUnpaidInvoices(): Invoice[] {
    return mockProvider.getInvoices().filter((i) =>
      ["SENT", "VIEWED", "OVERDUE", "PARTIAL", "DISPUTED"].includes(i.status)
    );
  },
};
