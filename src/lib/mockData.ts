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

export interface Expense {
  id: string;
  employee_name: string;
  category: 'Travel' | 'Accommodation' | 'Meals' | 'Equipment' | 'Training' | 'Miscellaneous';
  amount: number;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  department: 'Engineering' | 'Sales' | 'Marketing' | 'HR' | 'Finance' | 'Operations';
  notes: string;
  receipt_url?: string;
}

export interface RevenueTrend {
  month: string;
  mrr: number;
  arr: number;
  expenses: number;
  newSubscribers: number;
  churnRate: number;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  color: string;
}

export interface DepartmentUsage {
  department: string;
  amount: number;
}

export interface ARAgeing {
  bucket: string;
  amount: number;
  invoicesCount: number;
}

export const initialSubscriptions: Subscription[] = [
  {
    id: "SUB-8012",
    invoice_number: "LTI-INV-2026-00045",
    customer_name: "Acme Corporation",
    plan: "Enterprise",
    renewal_date: "2026-07-15",
    status: "Active",
    amount: 15000,
    currency: "USD",
    billing_cycle: "Annual",
    payment_terms: "Net-30",
    created_at: "2025-07-15"
  },
  {
    id: "SUB-4412",
    invoice_number: "LTI-INV-2026-00089",
    customer_name: "Globex Corporation",
    plan: "Professional",
    renewal_date: "2026-06-25",
    status: "Expiring",
    amount: 4500,
    currency: "USD",
    billing_cycle: "Quarterly",
    payment_terms: "Net-30",
    created_at: "2025-06-25"
  },
  {
    id: "SUB-2983",
    invoice_number: "LTI-INV-2026-00102",
    customer_name: "Initech LLC",
    plan: "Starter",
    renewal_date: "2026-06-30",
    status: "Active",
    amount: 1200,
    currency: "USD",
    billing_cycle: "Monthly",
    payment_terms: "Immediate",
    created_at: "2026-05-30"
  },
  {
    id: "SUB-9941",
    invoice_number: "LTI-INV-2026-00021",
    customer_name: "Umbrella Corp",
    plan: "Custom",
    renewal_date: "2026-06-10",
    status: "Expired",
    amount: 32000,
    currency: "USD",
    billing_cycle: "Annual",
    payment_terms: "Net-60",
    created_at: "2025-06-10"
  },
  {
    id: "SUB-1082",
    invoice_number: "LTI-INV-2026-00115",
    customer_name: "Hooli Inc",
    plan: "Enterprise",
    renewal_date: "2026-08-01",
    status: "Active",
    amount: 18000,
    currency: "USD",
    billing_cycle: "Annual",
    payment_terms: "Net-30",
    created_at: "2025-08-01"
  },
  {
    id: "SUB-7762",
    invoice_number: "LTI-INV-2026-00120",
    customer_name: "Cyberdyne Systems",
    plan: "Professional",
    renewal_date: "2026-06-28",
    status: "Expiring",
    amount: 5000,
    currency: "USD",
    billing_cycle: "Quarterly",
    payment_terms: "Net-30",
    created_at: "2025-12-28"
  },
  {
    id: "SUB-5542",
    invoice_number: "LTI-INV-2026-00130",
    customer_name: "Soylent Green Co",
    plan: "Starter",
    renewal_date: "2026-05-15",
    status: "Suspended",
    amount: 1200,
    currency: "USD",
    billing_cycle: "Monthly",
    payment_terms: "Immediate",
    created_at: "2026-04-15"
  }
];

export const initialExpenses: Expense[] = [
  {
    id: "EXP-2026-001",
    employee_name: "Prashanth P",
    category: "Equipment",
    amount: 1850,
    date: "2026-06-15",
    status: "Approved",
    department: "Engineering",
    notes: "MacBook accessories & 4K monitor for testing Dashboard widgets.",
    receipt_url: "/receipt_monitor.png"
  },
  {
    id: "EXP-2026-002",
    employee_name: "Deepesh M",
    category: "Travel",
    amount: 620,
    date: "2026-06-12",
    status: "Pending",
    department: "Engineering",
    notes: "Travel to onsite integration sync with Solution Architect Dilip.",
    receipt_url: "/receipt_travel.png"
  },
  {
    id: "EXP-2026-003",
    employee_name: "Brindha A S",
    category: "Meals",
    amount: 145,
    date: "2026-06-18",
    status: "Pending",
    department: "Finance",
    notes: "Lunch meeting with invoice metrics stakeholders.",
    receipt_url: "/receipt_lunch.png"
  },
  {
    id: "EXP-2026-004",
    employee_name: "Purushothaman M",
    category: "Training",
    amount: 999,
    date: "2026-06-10",
    status: "Approved",
    department: "Operations",
    notes: "AWS Certified Advanced Networking Course.",
    receipt_url: "/receipt_training.png"
  },
  {
    id: "EXP-2026-005",
    employee_name: "Jayashree V",
    category: "Miscellaneous",
    amount: 75,
    date: "2026-06-14",
    status: "Rejected",
    department: "Operations",
    notes: "Office plant decoration items (non-reimbursable criteria).",
    receipt_url: "/receipt_decoration.png"
  },
  {
    id: "EXP-2026-006",
    employee_name: "Dilip Velayutham",
    category: "Accommodation",
    amount: 1200,
    date: "2026-06-08",
    status: "Approved",
    department: "Finance",
    notes: "Hotel stay for corporate financial planning meeting.",
    receipt_url: "/receipt_hotel.png"
  }
];

export const revenueTrends: RevenueTrend[] = [
  { month: "Jan", mrr: 125000, arr: 1500000, expenses: 45000, newSubscribers: 42, churnRate: 1.8 },
  { month: "Feb", mrr: 132000, arr: 1584000, expenses: 48000, newSubscribers: 48, churnRate: 1.5 },
  { month: "Mar", mrr: 141000, arr: 1692000, expenses: 52000, newSubscribers: 55, churnRate: 2.1 },
  { month: "Apr", mrr: 148000, arr: 1776000, expenses: 49000, newSubscribers: 50, churnRate: 1.9 },
  { month: "May", mrr: 156000, arr: 1872000, expenses: 58000, newSubscribers: 62, churnRate: 1.4 },
  { month: "Jun", mrr: 168000, arr: 2016000, expenses: 54000, newSubscribers: 70, churnRate: 1.2 }
];

export const expenseBreakdown: ExpenseBreakdown[] = [
  { category: "Equipment", amount: 15400, color: "#3b82f6" },
  { category: "Travel", amount: 9800, color: "#10b981" },
  { category: "Accommodation", amount: 12600, color: "#f59e0b" },
  { category: "Meals", amount: 4200, color: "#ec4899" },
  { category: "Training", amount: 8500, color: "#8b5cf6" },
  { category: "Miscellaneous", amount: 2300, color: "#6b7280" }
];

export const departmentUsage: DepartmentUsage[] = [
  { department: "Engineering", amount: 24500 },
  { department: "Sales", amount: 12800 },
  { department: "Marketing", amount: 9600 },
  { department: "HR", amount: 3200 },
  { department: "Finance", amount: 1400 },
  { department: "Operations", amount: 1300 }
];

export const arAgeingBuckets: ARAgeing[] = [
  { bucket: "Current (0-30 Days)", amount: 48500, invoicesCount: 12 },
  { bucket: "Overdue (31-60 Days)", amount: 18200, invoicesCount: 5 },
  { bucket: "Overdue (61-90 Days)", amount: 9400, invoicesCount: 2 },
  { bucket: "Overdue (90+ Days)", amount: 5600, invoicesCount: 1 }
];
