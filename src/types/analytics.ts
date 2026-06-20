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

export interface AnalyticsPayload {
  trends: RevenueTrend[];
  expenseBreakdown: ExpenseBreakdown[];
  departmentUsage: DepartmentUsage[];
}
