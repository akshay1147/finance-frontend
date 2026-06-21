import { Subscription } from "@/types/subscription";
import { Expense } from "@/types/expense";

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

// Simple global memory state for dev server persistence
const globalSubscriptions: Subscription[] = [...initialSubscriptions];
const globalExpenses: Expense[] = [...initialExpenses];

export function getSubscriptions(): Subscription[] {
  return globalSubscriptions;
}

export function addSubscription(sub: Omit<Subscription, "id" | "invoice_number" | "created_at">): Subscription {
  const newSub: Subscription = {
    ...sub,
    id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
    invoice_number: `LTI-INV-2026-00${Math.floor(100 + Math.random() * 900)}`,
    created_at: new Date().toISOString().split('T')[0]
  };
  globalSubscriptions.unshift(newSub);
  return newSub;
}

export function updateSubscriptionStatus(id: string, status: Subscription["status"]): boolean {
  const index = globalSubscriptions.findIndex(s => s.id === id);
  if (index !== -1) {
    globalSubscriptions[index].status = status;
    return true;
  }
  return false;
}

export function getExpenses(): Expense[] {
  return globalExpenses;
}

export function addExpense(exp: Omit<Expense, "id" | "date" | "status">): Expense {
  const newExp: Expense = {
    ...exp,
    id: `EXP-2026-0${globalExpenses.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    status: "Pending"
  };
  globalExpenses.unshift(newExp);
  return newExp;
}

export function approveExpense(id: string): boolean {
  const index = globalExpenses.findIndex(e => e.id === id);
  if (index !== -1) {
    globalExpenses[index].status = "Approved";
    return true;
  }
  return false;
}

export function rejectExpense(id: string): boolean {
  const index = globalExpenses.findIndex(e => e.id === id);
  if (index !== -1) {
    globalExpenses[index].status = "Rejected";
    return true;
  }
  return false;
}
