import { NextResponse } from "next/server";
import { getSubscriptions, addSubscription, updateSubscriptionStatus } from "@/lib/db";
import { ApiResponse } from "@/types/api_response";
import { Subscription } from "@/types/subscription";

export async function GET() {
  try {
    const subscriptions = getSubscriptions();
    const response: ApiResponse<Subscription[]> = {
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
      metadata: { 
        count: subscriptions.length,
        page: 1,
        page_size: subscriptions.length,
        total: subscriptions.length,
        has_next: false
      }
    };
    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: "Failed to retrieve subscriptions",
      errors: [{ code: "INTERNAL_ERROR", message: error.message || "Unknown error occurred" }]
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, status, customer_name, plan, amount, currency, billing_cycle, payment_terms } = body;

    if (action === "update-status" && id && status) {
      const success = updateSubscriptionStatus(id, status);
      const response: ApiResponse<null> = {
        success,
        message: success ? "Subscription status updated" : "Subscription not found",
        data: null
      };
      return NextResponse.json(response, { status: success ? 200 : 404 });
    }

    if (!customer_name || !plan || !amount || !currency || !billing_cycle || !payment_terms) {
      const response: ApiResponse = {
        success: false,
        message: "Validation failed",
        errors: [{ code: "VALIDATION_ERROR", message: "Missing required subscription fields" }]
      };
      return NextResponse.json(response, { status: 400 });
    }

    const now = new Date();
    if (billing_cycle === "Monthly") {
      now.setMonth(now.getMonth() + 1);
    } else if (billing_cycle === "Quarterly") {
      now.setMonth(now.getMonth() + 3);
    } else if (billing_cycle === "Annual") {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    const renewal_date = now.toISOString().split("T")[0];

    const newSub = addSubscription({
      customer_name,
      plan,
      amount: Number(amount),
      currency,
      billing_cycle,
      payment_terms,
      status: "Active",
      renewal_date
    });

    const response: ApiResponse<Subscription> = {
      success: true,
      message: "Subscription created successfully",
      data: newSub
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
