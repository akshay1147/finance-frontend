import { NextResponse } from "next/server";
import { getExpenses, addExpense, approveExpense, rejectExpense } from "@/lib/db";
import { ApiResponse } from "@/types/api_response";
import { Expense } from "@/types/expense";

export async function GET() {
  try {
    const expenses = getExpenses();
    const response: ApiResponse<Expense[]> = {
      success: true,
      message: "Expenses retrieved successfully",
      data: expenses,
      metadata: { count: expenses.length }
    };
    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: "Failed to retrieve expenses",
      errors: [{ code: "INTERNAL_ERROR", message: error.message || "Unknown error occurred" }]
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, employee_name, category, amount, department, notes, receipt_url } = body;

    if (action === "approve" && id) {
      const success = approveExpense(id);
      const response: ApiResponse<null> = {
        success,
        message: success ? "Expense claim approved" : "Expense claim not found",
        data: null
      };
      return NextResponse.json(response, { status: success ? 200 : 404 });
    }

    if (action === "reject" && id) {
      const success = rejectExpense(id);
      const response: ApiResponse<null> = {
        success,
        message: success ? "Expense claim rejected" : "Expense claim not found",
        data: null
      };
      return NextResponse.json(response, { status: success ? 200 : 404 });
    }

    if (!employee_name || !category || !amount || !department || !notes) {
      const response: ApiResponse = {
        success: false,
        message: "Validation failed",
        errors: [{ code: "VALIDATION_ERROR", message: "Missing required expense fields" }]
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newExp = addExpense({
      employee_name,
      category,
      amount: Number(amount),
      department,
      notes,
      receipt_url: receipt_url || undefined
    });

    const response: ApiResponse<Expense> = {
      success: true,
      message: "Expense claim submitted successfully",
      data: newExp
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: "Invalid request payload",
      errors: [{ code: "BAD_REQUEST", message: error.message || "Invalid JSON input" }]
    };
    return NextResponse.json(response, { status: 400 });
  }
}
