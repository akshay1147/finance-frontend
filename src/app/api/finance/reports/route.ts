import { NextResponse } from "next/server";
import { arAgeingBuckets, expenseBreakdown, departmentUsage } from "@/lib/mockData";
import { getSubscriptions, getExpenses } from "@/lib/db";

export async function GET() {
  const subs = getSubscriptions();
  const exps = getExpenses();

  // Dynamically calculate some aggregate metrics based on mock db
  const totalSubRevenue = subs.reduce((sum, s) => s.status === "Active" ? sum + s.amount : sum, 0);
  const totalExpensesAmount = exps.reduce((sum, e) => e.status === "Approved" ? sum + e.amount : sum, 0);

  return NextResponse.json({
    arAgeing: arAgeingBuckets,
    expenseBreakdown,
    departmentUsage,
    totals: {
      activeSubscriptionRevenue: totalSubRevenue,
      approvedExpenses: totalExpensesAmount,
      invoiceCount: subs.length,
      expenseCount: exps.length
    }
  });
}
