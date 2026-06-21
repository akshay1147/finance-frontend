"use client";

export type {
  LineItem,
  InvoiceStatus,
  Invoice,
  Payment,
  Subscription,
  TaxCode,
} from "./types";

export { TAX_CODES } from "./mock_provider";
export { mockProvider } from "./mock_provider";
export { apiClient } from "./api_client";
export { invoiceService } from "./invoice_service";
export { queryClient } from "./query_client";
export {
  toUSD,
  formatCurrency,
  formatUSD,
  computeFinanceMetrics,
  computeTotalSettledUSD,
  computeARAgingMetrics,
  getMRRTrendData,
} from "./finance_transformer";
export { errorMonitor } from "./error_monitor";

import { mockProvider } from "./mock_provider";
import {
  computeFinanceMetrics,
  computeARAgingMetrics,
  getMRRTrendData,
} from "./finance_transformer";

export const getInvoices = () => mockProvider.getInvoices();
export const getPayments = () => mockProvider.getPayments();
export const getSubscriptions = () => mockProvider.getSubscriptions();
export const saveInvoice = mockProvider.saveInvoice.bind(mockProvider);
export const updateInvoice = mockProvider.updateInvoice.bind(mockProvider);
export const recordPayment = mockProvider.recordPayment.bind(mockProvider);
export const getFinanceMetrics = () => computeFinanceMetrics();
export const getARAgingMetrics = () => computeARAgingMetrics();
