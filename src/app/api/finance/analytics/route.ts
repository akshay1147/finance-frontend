import { NextResponse } from "next/server";
import { revenueTrends, expenseBreakdown, departmentUsage } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    trends: revenueTrends,
    expenseBreakdown,
    departmentUsage
  });
}
