import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/types/api_response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, amount, currency } = body as {
      invoiceId?: string;
      amount?: number;
      currency?: string;
    };

    if (!invoiceId || amount == null || !currency) {
      return NextResponse.json(
        createErrorResponse(
          "INVALID_REQUEST",
          "invoiceId, amount, and currency are required",
          "Provide all required payment intent fields."
        ),
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (secretKey) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(secretKey);

      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: { invoiceId },
        automatic_payment_methods: { enabled: true },
      });

      return NextResponse.json(
        createSuccessResponse(
          { clientSecret: intent.client_secret },
          "Payment intent created"
        )
      );
    }

    // Sandbox fallback when no secret key is configured
    const clientSecret = `pi_sandbox_${invoiceId}_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`;
    return NextResponse.json(
      createSuccessResponse({ clientSecret }, "Sandbox payment intent created", {
        mode: "sandbox",
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment intent creation failed";
    return NextResponse.json(
      createErrorResponse("INTENT_CREATE_FAILED", message, "Verify Stripe secret key configuration."),
      { status: 500 }
    );
  }
}
