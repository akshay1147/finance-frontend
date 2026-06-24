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
  invoice_id: string;
  invoice_number: string;
  account_id: string;
  account_name: string;
  contract_id?: string;
  line_items: LineItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: "USD" | "INR" | "EUR";
  due_date: string;
  status: InvoiceStatus;
  pdf_url?: string;
  payment_terms: "Net-30" | "Net-60" | "Immediate";
  issued_date: string;
  paid_date?: string;
  created_by: string;
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
  rate: number;
  applied_to: string;
  notes?: string;
}
