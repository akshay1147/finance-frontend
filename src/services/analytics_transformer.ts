import { Subscription } from "@/types/subscription";
import { Expense } from "@/types/expense";

export class AnalyticsTransformer {
  static calculateMRR(subscriptions: Subscription[]): number {
    return subscriptions
      .filter(s => s.status === "Active" || s.status === "Expiring")
      .reduce((sum, s) => {
        let monthlyVal = s.amount;
        if (s.billing_cycle === "Quarterly") monthlyVal = s.amount / 3;
        if (s.billing_cycle === "Annual") monthlyVal = s.amount / 12;
        return sum + monthlyVal;
      }, 0);
  }

  static calculateARR(mrr: number): number {
    return mrr * 12;
  }

  static aggregateExpenses(expenses: Expense[]) {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const approvedExpenses = expenses
      .filter(e => e.status === "Approved")
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingCount = expenses.filter(e => e.status === "Pending").length;
    return { totalExpenses, approvedExpenses, pendingCount };
  }

  static formatCurrency(amount: number, digits: number = 0): string {
    return amount.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
}
