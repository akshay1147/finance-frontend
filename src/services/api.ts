"use client";

// Define TypeScript interfaces matching Section 5 and 6 of the PDF Specification

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_code: string;
  tax_amount: number;
  total: number;
}

export type InvoiceStatus = 
  | "DRAFT" 
  | "SENT" 
  | "VIEWED" 
  | "PARTIAL" 
  | "PAID" 
  | "OVERDUE" 
  | "DISPUTED" 
  | "CANCELLED" 
  | "WRITTEN_OFF";

export interface Invoice {
  invoice_id: string; // UUID
  invoice_number: string; // LTI-INV-YYYY-NNNNN
  account_id: string; // client name/id
  account_name: string; // client display name
  contract_id?: string;
  line_items: LineItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: "USD" | "INR" | "EUR";
  due_date: string; // ISO
  status: InvoiceStatus;
  pdf_url?: string;
  payment_terms: "Net-30" | "Net-60" | "Immediate";
  issued_date: string; // ISO
  paid_date?: string; // ISO
  created_by: string; // User ID
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  payment_id: string;
  invoice_id: string;
  invoice_number: string;
  account_name: string;
  amount: number;
  currency: "USD" | "INR" | "EUR";
  payment_date: string;
  payment_method: "card" | "ach" | "sepa" | "upi" | "wire";
  reference_number: string;
  status: "succeeded" | "failed" | "pending";
  stripe_payment_id?: string;
}

export interface Subscription {
  subscription_id: string;
  account_id: string;
  account_name: string;
  stripe_subscription_id: string;
  plan: "Starter" | "Professional" | "Enterprise" | "Custom";
  billing_cycle: "monthly" | "quarterly" | "annual";
  amount: number;
  currency: "USD" | "INR" | "EUR";
  status: "active" | "past_due" | "canceled" | "trialing";
  trial_end?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface TaxCode {
  code: string;
  jurisdiction: string;
  rate: number; // e.g., 0.18 for 18%
  applied_to: string;
  notes?: string;
}

// Global Tax Rules
export const TAX_CODES: TaxCode[] = [
  { code: "GST_18", jurisdiction: "India", rate: 0.18, applied_to: "All services", notes: "CGST 9% + SGST 9% split" },
  { code: "GST_0", jurisdiction: "India", rate: 0.0, applied_to: "Export of services", notes: "LUT filing required" },
  { code: "VAT_20", jurisdiction: "UK", rate: 0.20, applied_to: "All taxable supplies", notes: "VAT registration required" },
  { code: "VAT_19", jurisdiction: "Germany", rate: 0.19, applied_to: "Standard goods/services" },
  { code: "US_SALES", jurisdiction: "US", rate: 0.08, applied_to: "Product sales (Varies by state)" },
  { code: "TDS_10", jurisdiction: "India", rate: 0.10, applied_to: "Professional services", notes: "TDS withholding cert required" },
  { code: "ZERO_RATE", jurisdiction: "Global", rate: 0.0, applied_to: "Exempt categories" },
];

// Pre-populated seed data
const SEED_INVOICES: Invoice[] = [
  {
    invoice_id: "inv-90341-a1",
    invoice_number: "LTI-INV-2026-00101",
    account_id: "acc-microsoft",
    account_name: "Microsoft Corp",
    contract_id: "con-ms-091",
    line_items: [
      { description: "Enterprise Cloud Workspace Setups", quantity: 1, unit_price: 24000, tax_code: "US_SALES", tax_amount: 1920, total: 25920 },
      { description: "LMS Platform Integration Consultation", quantity: 15, unit_price: 200, tax_code: "US_SALES", tax_amount: 240, total: 3240 }
    ],
    subtotal: 27000,
    tax_amount: 2160,
    total_amount: 29160,
    currency: "USD",
    due_date: "2026-05-15T00:00:00Z", // Past due -> Overdue
    status: "OVERDUE",
    payment_terms: "Net-30",
    issued_date: "2026-04-15T10:00:00Z",
    created_by: "staff-01",
    notes: "Requires quick follow up. Account rep flagged.",
    created_at: "2026-04-15T09:30:00Z",
    updated_at: "2026-05-16T12:00:00Z",
  },
  {
    invoice_id: "inv-90342-a2",
    invoice_number: "LTI-INV-2026-00102",
    account_id: "acc-reliance",
    account_name: "Reliance Industries",
    contract_id: "con-ril-044",
    line_items: [
      { description: "LMS Platform Subscriptions - Professional Plan", quantity: 120, unit_price: 30, tax_code: "GST_18", tax_amount: 648, total: 4248 },
      { description: "Development Hours (Workspace customization)", quantity: 40, unit_price: 85, tax_code: "GST_18", tax_amount: 612, total: 4012 }
    ],
    subtotal: 7000,
    tax_amount: 1260,
    total_amount: 8260,
    currency: "INR",
    due_date: "2026-06-30T00:00:00Z",
    status: "SENT",
    payment_terms: "Net-30",
    issued_date: "2026-05-31T09:00:00Z",
    created_by: "staff-02",
    created_at: "2026-05-31T08:00:00Z",
    updated_at: "2026-05-31T09:00:00Z",
  },
  {
    invoice_id: "inv-90343-a3",
    invoice_number: "LTI-INV-2026-00103",
    account_id: "acc-bmw",
    account_name: "BMW Group AG",
    contract_id: "con-bmw-102",
    line_items: [
      { description: "Dedicated Workspace Server Node (Annual)", quantity: 1, unit_price: 15000, tax_code: "VAT_19", tax_amount: 2850, total: 17850 }
    ],
    subtotal: 15000,
    tax_amount: 2850,
    total_amount: 17850,
    currency: "EUR",
    due_date: "2026-06-15T00:00:00Z",
    status: "PAID",
    payment_terms: "Net-30",
    issued_date: "2026-05-16T14:00:00Z",
    paid_date: "2026-06-02T11:45:00Z",
    created_by: "staff-01",
    created_at: "2026-05-16T12:00:00Z",
    updated_at: "2026-06-02T11:45:00Z",
  },
  {
    invoice_id: "inv-90344-a4",
    invoice_number: "LTI-INV-2026-00104",
    account_id: "acc-acme",
    account_name: "Acme Corp",
    contract_id: "con-acme-992",
    line_items: [
      { description: "Workspace Premium Subscription (Month 3)", quantity: 1, unit_price: 499, tax_code: "US_SALES", tax_amount: 39.92, total: 538.92 }
    ],
    subtotal: 499,
    tax_amount: 39.92,
    total_amount: 538.92,
    currency: "USD",
    due_date: "2026-07-19T00:00:00Z",
    status: "SENT",
    payment_terms: "Net-30",
    issued_date: "2026-06-19T10:00:00Z",
    created_by: "staff-02",
    created_at: "2026-06-19T09:30:00Z",
    updated_at: "2026-06-19T10:00:00Z",
  },
  {
    invoice_id: "inv-90345-a5",
    invoice_number: "LTI-INV-2026-00105",
    account_id: "acc-tata",
    account_name: "Tata Consultancy Services",
    contract_id: "con-tcs-401",
    line_items: [
      { description: "Workspace License Addons (100 Seats)", quantity: 100, unit_price: 15, tax_code: "GST_18", tax_amount: 270, total: 1770 }
    ],
    subtotal: 1500,
    tax_amount: 270,
    total_amount: 1770,
    currency: "INR",
    due_date: "2026-07-05T00:00:00Z",
    status: "DISPUTED",
    payment_terms: "Net-30",
    issued_date: "2026-06-05T12:00:00Z",
    created_by: "staff-03",
    notes: "Client claiming seat counts are incorrect. Under review.",
    created_at: "2026-06-05T11:00:00Z",
    updated_at: "2026-06-07T15:20:00Z",
  },
  {
    invoice_id: "inv-90346-a6",
    invoice_number: "LTI-INV-2026-00106",
    account_id: "acc-stripe",
    account_name: "Stripe Inc",
    contract_id: "con-st-022",
    line_items: [
      { description: "Internal Developer Training Program", quantity: 3, unit_price: 3500, tax_code: "US_SALES", tax_amount: 840, total: 11340 }
    ],
    subtotal: 10500,
    tax_amount: 840,
    total_amount: 11340,
    currency: "USD",
    due_date: "2026-04-01T00:00:00Z",
    status: "PAID",
    payment_terms: "Net-30",
    issued_date: "2026-03-02T10:00:00Z",
    paid_date: "2026-03-25T16:10:00Z",
    created_by: "staff-01",
    created_at: "2026-03-02T09:00:00Z",
    updated_at: "2026-03-25T16:10:00Z",
  },
  {
    invoice_id: "inv-90347-a7",
    invoice_number: "LTI-INV-2026-00107",
    account_id: "acc-git",
    account_name: "Github Corp",
    line_items: [
      { description: "Premium Support package setup fee", quantity: 1, unit_price: 5000, tax_code: "US_SALES", tax_amount: 400, total: 5400 }
    ],
    subtotal: 5000,
    tax_amount: 400,
    total_amount: 5400,
    currency: "USD",
    due_date: "2026-07-20T00:00:00Z",
    status: "DRAFT",
    payment_terms: "Net-30",
    issued_date: "2026-06-20T00:00:00Z",
    created_by: "staff-02",
    created_at: "2026-06-18T14:00:00Z",
    updated_at: "2026-06-18T14:00:00Z",
  }
];

const SEED_PAYMENTS: Payment[] = [
  {
    payment_id: "pay-001",
    invoice_id: "inv-90343-a3",
    invoice_number: "LTI-INV-2026-00103",
    account_name: "BMW Group AG",
    amount: 17850,
    currency: "EUR",
    payment_date: "2026-06-02T11:45:00Z",
    payment_method: "wire",
    reference_number: "TXN-BMW-903241",
    status: "succeeded",
  },
  {
    payment_id: "pay-002",
    invoice_id: "inv-90346-a6",
    invoice_number: "LTI-INV-2026-00106",
    account_name: "Stripe Inc",
    amount: 11340,
    currency: "USD",
    payment_date: "2026-03-25T16:10:00Z",
    payment_method: "card",
    reference_number: "ch_stripe_902341",
    status: "succeeded",
    stripe_payment_id: "ch_stripe_902341",
  }
];

const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    subscription_id: "sub-001",
    account_id: "acc-acme",
    account_name: "Acme Corp",
    stripe_subscription_id: "sub_1Ndf23Stripe",
    plan: "Starter",
    billing_cycle: "monthly",
    amount: 499,
    currency: "USD",
    status: "active",
    current_period_start: "2026-06-01T00:00:00Z",
    current_period_end: "2026-07-01T00:00:00Z",
    cancel_at_period_end: false,
    created_at: "2026-04-01T10:00:00Z",
  },
  {
    subscription_id: "sub-002",
    account_id: "acc-reliance",
    account_name: "Reliance Industries",
    stripe_subscription_id: "sub_1Ndf45Stripe",
    plan: "Professional",
    billing_cycle: "quarterly",
    amount: 3200,
    currency: "INR",
    status: "active",
    current_period_start: "2026-04-01T00:00:00Z",
    current_period_end: "2026-07-01T00:00:00Z",
    cancel_at_period_end: false,
    created_at: "2026-01-01T10:00:00Z",
  }
];

// LocalStorage Helper Keys
const STORAGE_INVOICES = "lti_fin_invoices";
const STORAGE_PAYMENTS = "lti_fin_payments";
const STORAGE_SUBSCRIPTIONS = "lti_fin_subscriptions";

// Initialize data if not present
const isBrowser = typeof window !== "undefined";

export const getInvoices = (): Invoice[] => {
  if (!isBrowser) return SEED_INVOICES;
  const stored = localStorage.getItem(STORAGE_INVOICES);
  if (!stored) {
    localStorage.setItem(STORAGE_INVOICES, JSON.stringify(SEED_INVOICES));
    return SEED_INVOICES;
  }
  return JSON.parse(stored);
};

export const getPayments = (): Payment[] => {
  if (!isBrowser) return SEED_PAYMENTS;
  const stored = localStorage.getItem(STORAGE_PAYMENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_PAYMENTS, JSON.stringify(SEED_PAYMENTS));
    return SEED_PAYMENTS;
  }
  return JSON.parse(stored);
};

export const getSubscriptions = (): Subscription[] => {
  if (!isBrowser) return SEED_SUBSCRIPTIONS;
  const stored = localStorage.getItem(STORAGE_SUBSCRIPTIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_SUBSCRIPTIONS, JSON.stringify(SEED_SUBSCRIPTIONS));
    return SEED_SUBSCRIPTIONS;
  }
  return JSON.parse(stored);
};

// Create new draft invoice
export const saveInvoice = (invoice: Omit<Invoice, "invoice_id" | "invoice_number" | "created_at" | "updated_at">): Invoice => {
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  const nextNum = invoices.length + 101;
  const invoice_number = `LTI-INV-${year}-${String(nextNum).padStart(5, "0")}`;
  const invoice_id = `inv-${Math.random().toString(36).substr(2, 9)}`;
  const nowStr = new Date().toISOString();

  const newInvoice: Invoice = {
    ...invoice,
    invoice_id,
    invoice_number,
    created_at: nowStr,
    updated_at: nowStr,
  };

  invoices.push(newInvoice);
  localStorage.setItem(STORAGE_INVOICES, JSON.stringify(invoices));
  return newInvoice;
};

// Update invoice status or fields
export const updateInvoice = (invoiceId: string, updates: Partial<Invoice>): Invoice => {
  const invoices = getInvoices();
  const idx = invoices.findIndex((i) => i.invoice_id === invoiceId);
  if (idx === -1) throw new Error("Invoice not found");

  const updatedInvoice = {
    ...invoices[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  invoices[idx] = updatedInvoice;
  localStorage.setItem(STORAGE_INVOICES, JSON.stringify(invoices));
  return updatedInvoice;
};

// Record payment (wire transfer / Stripe checkout)
export const recordPayment = (
  invoiceId: string, 
  payment: Omit<Payment, "payment_id" | "invoice_id" | "invoice_number" | "account_name" | "status" | "currency" | "amount" | "payment_date">
): Payment => {
  const invoices = getInvoices();
  const inv = invoices.find((i) => i.invoice_id === invoiceId);
  if (!inv) throw new Error("Invoice not found");

  const payments = getPayments();
  const payment_id = `pay-${Math.random().toString(36).substr(2, 9)}`;

  const newPayment: Payment = {
    payment_id,
    invoice_id: inv.invoice_id,
    invoice_number: inv.invoice_number,
    account_name: inv.account_name,
    amount: inv.total_amount,
    currency: inv.currency,
    payment_date: new Date().toISOString(),
    payment_method: payment.payment_method,
    reference_number: payment.reference_number,
    status: "succeeded",
    stripe_payment_id: payment.stripe_payment_id,
  };

  payments.push(newPayment);
  localStorage.setItem(STORAGE_PAYMENTS, JSON.stringify(payments));

  // Mark invoice as PAID
  updateInvoice(invoiceId, {
    status: "PAID",
    paid_date: newPayment.payment_date,
  });

  return newPayment;
};

// KPI Dashboard aggregations
export const getFinanceMetrics = () => {
  const invoices = getInvoices();
  const payments = getPayments();
  const subscriptions = getSubscriptions();

  // Exchange rates normalized to USD (USD=1.0, EUR=1.08, INR=0.012)
  const toUSD = (amount: number, curr: "USD" | "INR" | "EUR") => {
    if (curr === "USD") return amount;
    if (curr === "EUR") return amount * 1.08;
    return amount * 0.012;
  };

  // 1. Total Revenue (succeeded payments)
  const totalRevenueUSD = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + toUSD(p.amount, p.currency), 0);

  // 2. Active Invoices (Draft, Sent, Viewed, Partial, Disputed)
  const activeInvoicesCount = invoices.filter((i) => 
    ["DRAFT", "SENT", "VIEWED", "PARTIAL", "DISPUTED"].includes(i.status)
  ).length;

  // 3. Outstanding Payments (Sent, Viewed, Partial, Disputed total amounts)
  const outstandingPaymentsUSD = invoices
    .filter((i) => ["SENT", "VIEWED", "PARTIAL", "DISPUTED", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + toUSD(i.total_amount, i.currency), 0);

  // 4. Collection rate = total received / (total received + total outstanding)
  const totalBilled = totalRevenueUSD + outstandingPaymentsUSD;
  const collectionRate = totalBilled > 0 ? (totalRevenueUSD / totalBilled) * 100 : 100;

  // 5. Monthly Recurring Revenue (MRR) from subscriptions
  const mrrUSD = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const amt = toUSD(s.amount, s.currency);
      if (s.billing_cycle === "monthly") return sum + amt;
      if (s.billing_cycle === "quarterly") return sum + (amt / 3);
      return sum + (amt / 12);
    }, 0);

  return {
    totalRevenueUSD,
    activeInvoicesCount,
    outstandingPaymentsUSD,
    collectionRate,
    mrrUSD,
  };
};

// Calculate AR aging buckets: 0-30, 31-60, 61-90, 90+ days
export const getARAgingMetrics = () => {
  const invoices = getInvoices();
  const today = new Date();

  // Exchange rates normalized to USD
  const toUSD = (amount: number, curr: "USD" | "INR" | "EUR") => {
    if (curr === "USD") return amount;
    if (curr === "EUR") return amount * 1.08;
    return amount * 0.012;
  };

  const buckets = {
    current: 0,   // 0-30 days
    thirtyToSixty: 0, // 31-60 days
    sixtyToNinety: 0, // 61-90 days
    overNinety: 0, // 90+ days
  };

  invoices
    .filter((i) => ["SENT", "VIEWED", "PARTIAL", "DISPUTED", "OVERDUE"].includes(i.status))
    .forEach((i) => {
      const issueDate = new Date(i.issued_date);
      const diffTime = Math.abs(today.getTime() - issueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const value = toUSD(i.total_amount, i.currency);

      if (diffDays <= 30) {
        buckets.current += value;
      } else if (diffDays <= 60) {
        buckets.thirtyToSixty += value;
      } else if (diffDays <= 90) {
        buckets.sixtyToNinety += value;
      } else {
        buckets.overNinety += value;
      }
    });

  return [
    { name: "0-30 Days", amount: Math.round(buckets.current) },
    { name: "31-60 Days", amount: Math.round(buckets.thirtyToSixty) },
    { name: "61-90 Days", amount: Math.round(buckets.sixtyToNinety) },
    { name: "90+ Days", amount: Math.round(buckets.overNinety) },
  ];
};

// Calculate MRR Trend (Monthly MRR, Churn, New revenue)
export const getMRRTrendData = () => {
  // Return seed trend data for the last 6 months
  return [
    { month: "Jan 2026", MRR: 45000, NewRevenue: 5000, Churn: 1200 },
    { month: "Feb 2026", MRR: 48800, NewRevenue: 6000, Churn: 800 },
    { month: "Mar 2026", MRR: 54000, NewRevenue: 7500, Churn: 1500 },
    { month: "Apr 2026", MRR: 60000, NewRevenue: 8000, Churn: 1200 },
    { month: "May 2026", MRR: 66800, NewRevenue: 7800, Churn: 900 },
    { month: "Jun 2026", MRR: 72400, NewRevenue: 9200, Churn: 1500 },
  ];
};
