import { RevenueTrend, ExpenseBreakdown, DepartmentUsage, AnalyticsPayload } from "@/types/analytics";

const revenueTrends: RevenueTrend[] = [
  { month: "Jan", mrr: 125000, arr: 1500000, expenses: 45000, newSubscribers: 42, churnRate: 1.8 },
  { month: "Feb", mrr: 132000, arr: 1584000, expenses: 48000, newSubscribers: 48, churnRate: 1.5 },
  { month: "Mar", mrr: 141000, arr: 1692000, expenses: 52000, newSubscribers: 55, churnRate: 2.1 },
  { month: "Apr", mrr: 148000, arr: 1776000, expenses: 49000, newSubscribers: 50, churnRate: 1.9 },
  { month: "May", mrr: 156000, arr: 1872000, expenses: 58000, newSubscribers: 62, churnRate: 1.4 },
  { month: "Jun", mrr: 168000, arr: 2016000, expenses: 54000, newSubscribers: 70, churnRate: 1.2 }
];

const expenseBreakdown: ExpenseBreakdown[] = [
  { category: "Equipment", amount: 15400, color: "#3b82f6" },
  { category: "Travel", amount: 9800, color: "#10b981" },
  { category: "Accommodation", amount: 12600, color: "#f59e0b" },
  { category: "Meals", amount: 4200, color: "#ec4899" },
  { category: "Training", amount: 8500, color: "#8b5cf6" },
  { category: "Miscellaneous", amount: 2300, color: "#6b7280" }
];

const departmentUsage: DepartmentUsage[] = [
  { department: "Engineering", amount: 24500 },
  { department: "Sales", amount: 12800 },
  { department: "Marketing", amount: 9600 },
  { department: "HR", amount: 3200 },
  { department: "Finance", amount: 1400 },
  { department: "Operations", amount: 1300 }
];

export class AnalyticsService {
  public getAnalyticsPayload(): AnalyticsPayload {
    return {
      trends: revenueTrends,
      expenseBreakdown,
      departmentUsage
    };
  }
}

export const analyticsService = new AnalyticsService();
