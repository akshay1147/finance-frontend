export interface Subscription {
  id: string;
  invoice_number: string;
  customer_name: string;
  plan: 'Starter' | 'Professional' | 'Enterprise' | 'Custom';
  renewal_date: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Suspended';
  amount: number;
  currency: string;
  billing_cycle: 'Monthly' | 'Quarterly' | 'Annual';
  payment_terms: string;
  created_at: string;
}
