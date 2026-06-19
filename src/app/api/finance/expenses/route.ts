import { NextResponse } from "next/server";
import { getExpenses, addExpense, approveExpense, rejectExpense } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getExpenses());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, employee_name, category, amount, department, notes, receipt_url } = body;

    if (action === "approve" && id) {
      const success = approveExpense(id);
      return NextResponse.json({ success, message: success ? "Expense approved" : "Expense not found" });
    }

    if (action === "reject" && id) {
      const success = rejectExpense(id);
      return NextResponse.json({ success, message: success ? "Expense rejected" : "Expense not found" });
    }

    if (!employee_name || !category || !amount || !department || !notes) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newExp = addExpense({
      employee_name,
      category,
      amount: Number(amount),
      department,
      notes,
      receipt_url: receipt_url || undefined
    });

    return NextResponse.json(newExp, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
