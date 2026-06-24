export interface ReportTotals {
  activeSubscriptionRevenue: number;
  approvedExpenses: number;
  invoiceCount: number;
  expenseCount: number;
}

export interface ARAgeingItem {
  bucket: string;
  amount: number;
  invoicesCount: number;
}

export interface TaxLiabilityItem {
  jurisdiction: string;
  serviceType: string;
  rate: string;
  collected: number;
  details: string;
}

export interface PLItem {
  category: string;
  label: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface DepartmentSpendItem {
  dept: string;
  approved: string;
  pending: string;
  cap: string;
  percentage: string;
}
