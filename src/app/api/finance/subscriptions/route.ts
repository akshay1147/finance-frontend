import { NextResponse } from "next/server";
import { getSubscriptions, addSubscription, updateSubscriptionStatus } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getSubscriptions());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, status, customer_name, plan, amount, currency, billing_cycle, payment_terms } = body;

    if (action === "update-status" && id && status) {
      const success = updateSubscriptionStatus(id, status);
      return NextResponse.json({ success, message: success ? "Status updated" : "Subscription not found" });
    }

    if (!customer_name || !plan || !amount || !currency || !billing_cycle || !payment_terms) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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

    return NextResponse.json(newSub, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
