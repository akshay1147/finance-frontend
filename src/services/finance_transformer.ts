import { mockProvider } from "./mock_provider";
import type { Invoice, Payment, Subscription } from "./types";

const EXCHANGE_RATES: Record<"USD" | "INR" | "EUR", number> = {
  USD: 1.0,
  EUR: 1.08,
  INR: 0.012,
};

export function toUSD(amount: number, currency: "USD" | "INR" | "EUR"): number {
  return amount * EXCHANGE_RATES[currency];
}

export function formatCurrency(
  amount: number,
  currency: "USD" | "INR" | "EUR",
  maximumFractionDigits = 2
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount);
}

export function formatUSD(amount: number, maximumFractionDigits = 0): string {
  return formatCurrency(amount, "USD", maximumFractionDigits);
}

export interface FinanceMetrics {
  totalRevenueUSD: number;
  activeInvoicesCount: number;
  outstandingPaymentsUSD: number;
  collectionRate: number;
  mrrUSD: number;
}

export interface ARAgingBucket {
  name: string;
  amount: number;
}

export function computeFinanceMetrics(
  invoices?: Invoice[],
  payments?: Payment[],
  subscriptions?: Subscription[]
): FinanceMetrics {
  const inv = invoices ?? mockProvider.getInvoices();
  const pay = payments ?? mockProvider.getPayments();
  const subs = subscriptions ?? mockProvider.getSubscriptions();

  const totalRevenueUSD = pay
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + toUSD(p.amount, p.currency), 0);

  const activeInvoicesCount = inv.filter((i) =>
    ["DRAFT", "SENT", "VIEWED", "PARTIAL", "DISPUTED"].includes(i.status)
  ).length;

  const outstandingPaymentsUSD = inv
    .filter((i) => ["SENT", "VIEWED", "PARTIAL", "DISPUTED", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + toUSD(i.total_amount, i.currency), 0);

  const totalBilled = totalRevenueUSD + outstandingPaymentsUSD;
  const collectionRate = totalBilled > 0 ? (totalRevenueUSD / totalBilled) * 100 : 100;

  const mrrUSD = subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const amt = toUSD(s.amount, s.currency);
      if (s.billing_cycle === "monthly") return sum + amt;
      if (s.billing_cycle === "quarterly") return sum + amt / 3;
      return sum + amt / 12;
    }, 0);

  return {
    totalRevenueUSD,
    activeInvoicesCount,
    outstandingPaymentsUSD,
    collectionRate,
    mrrUSD,
  };
}

export function computeTotalSettledUSD(payments?: Payment[]): number {
  const pay = payments ?? mockProvider.getPayments();
  return pay.reduce((sum, p) => sum + toUSD(p.amount, p.currency), 0);
}

export function computeARAgingMetrics(invoices?: Invoice[]): ARAgingBucket[] {
  const inv = invoices ?? mockProvider.getInvoices();
  const today = new Date();

  const buckets = {
    current: 0,
    thirtyToSixty: 0,
    sixtyToNinety: 0,
    overNinety: 0,
  };

  inv
    .filter((i) => ["SENT", "VIEWED", "PARTIAL", "DISPUTED", "OVERDUE"].includes(i.status))
    .forEach((i) => {
      const issueDate = new Date(i.issued_date);
      const diffDays = Math.ceil(Math.abs(today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      const value = toUSD(i.total_amount, i.currency);

      if (diffDays <= 30) buckets.current += value;
      else if (diffDays <= 60) buckets.thirtyToSixty += value;
      else if (diffDays <= 90) buckets.sixtyToNinety += value;
      else buckets.overNinety += value;
    });

  return [
    { name: "0-30 Days", amount: Math.round(buckets.current) },
    { name: "31-60 Days", amount: Math.round(buckets.thirtyToSixty) },
    { name: "61-90 Days", amount: Math.round(buckets.sixtyToNinety) },
    { name: "90+ Days", amount: Math.round(buckets.overNinety) },
  ];
}

export function getMRRTrendData() {
  return mockProvider.getMRRTrendSeed();
}
