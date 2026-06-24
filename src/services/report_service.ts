import { ARAgeingItem } from "@/types/report";
import { getSubscriptions, getExpenses } from "@/lib/db";
import { analyticsService } from "./analytics_service";

const arAgeingBuckets: ARAgeingItem[] = [
  { bucket: "Current (0-30 Days)", amount: 48500, invoicesCount: 12 },
  { bucket: "Overdue (31-60 Days)", amount: 18200, invoicesCount: 5 },
  { bucket: "Overdue (61-90 Days)", amount: 9400, invoicesCount: 2 },
  { bucket: "Overdue (90+ Days)", amount: 5600, invoicesCount: 1 }
];

export class ReportService {
  public getReportsAggregates() {
    const subs = getSubscriptions();
    const exps = getExpenses();

    const totalSubRevenue = subs.reduce((sum, s) => s.status === "Active" ? sum + s.amount : sum, 0);
    const totalExpensesAmount = exps.reduce((sum, e) => e.status === "Approved" ? sum + e.amount : sum, 0);

    const analyticsData = analyticsService.getAnalyticsPayload();

    return {
      arAgeing: arAgeingBuckets,
      expenseBreakdown: analyticsData.expenseBreakdown,
      departmentUsage: analyticsData.departmentUsage,
      totals: {
        activeSubscriptionRevenue: totalSubRevenue,
        approvedExpenses: totalExpensesAmount,
        invoiceCount: subs.length,
        expenseCount: exps.length
      }
    };
  }
}

export const reportService = new ReportService();
