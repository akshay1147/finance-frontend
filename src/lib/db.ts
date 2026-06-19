import {
  initialSubscriptions,
  initialExpenses,
  Subscription,
  Expense
} from "./mockData";

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
