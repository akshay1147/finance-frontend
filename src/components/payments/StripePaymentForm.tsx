"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Lock, ShieldAlert, RefreshCw, AlertTriangle } from "lucide-react";
import { apiClient } from "@/services/api_client";
import { errorMonitor } from "@/services/error_monitor";
import type { Invoice } from "@/services/types";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_KEY ??
  "pk_test_51MockLTIBackendKeyOnlyForSecureCheckoutToTokenizeDirectlyWithStripe";

const stripePromise = loadStripe(stripePublishableKey);

interface CheckoutFormProps {
  invoice: Invoice;
  onSuccess: (paymentRef: string) => void;
}

function CheckoutForm({ invoice, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardholderName, setCardholderName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system is still loading. Please wait.");
      return;
    }

    if (!cardholderName.trim()) {
      setError("Cardholder name is required");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const intentResponse = await apiClient.createPaymentIntent(
        invoice.invoice_id,
        invoice.total_amount,
        invoice.currency
      );

      if (!intentResponse.success || !intentResponse.data?.clientSecret) {
        setError(intentResponse.message || "Unable to initialize payment.");
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Card element not found. Please refresh and try again.");
        return;
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { name: cardholderName },
      });

      if (pmError || !paymentMethod) {
        errorMonitor.trackPaymentFailure(invoice.invoice_id, pmError?.message ?? "Payment method creation failed");
        setError(pmError?.message ?? "Unable to tokenize card details.");
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        clientSecret: intentResponse.data.clientSecret,
        confirmParams: {
          payment_method: paymentMethod.id,
          return_url: `${window.location.origin}/billing/pay?invoice=${invoice.invoice_number}&status=complete`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        errorMonitor.trackPaymentFailure(invoice.invoice_id, confirmError.message ?? "Payment failed");
        setError(confirmError.message ?? "Payment authorization failed.");
        return;
      }

      const paymentRef = paymentIntent?.id ?? `pi_confirmed_${Date.now()}`;

      const recordResponse = await apiClient.recordPayment(invoice.invoice_id, {
        payment_method: "card",
        reference_number: paymentRef,
        stripe_payment_id: paymentRef,
      });

      if (!recordResponse.success) {
        setError("Payment succeeded but invoice reconciliation failed. Contact support.");
        return;
      }

      onSuccess(paymentRef);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected payment error";
      errorMonitor.trackPaymentFailure(invoice.invoice_id, message);
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-300" aria-label="Secure card payment form">
      <div>
        <label htmlFor="cardholder-name" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          Cardholder Name
        </label>
        <input
          id="cardholder-name"
          type="text"
          required
          aria-required="true"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="e.g. John Doe"
          className="glass-input w-full px-3 py-2 mt-1 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
          disabled={processing}
        />
      </div>

      <div>
        <label htmlFor="card-element" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          Credit or Debit Card Details
        </label>

        <div
          id="card-element"
          className="mt-1 p-3 rounded-xl bg-slate-950/40 border border-slate-800 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/30 transition-all"
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "13px",
                  color: "#e2e8f0",
                  fontFamily: "Outfit, Inter, sans-serif",
                  "::placeholder": { color: "#94a3b8" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>

        <div
          className="flex items-center space-x-1.5 mt-2 text-[10px] text-purple-400 font-medium bg-purple-500/5 p-2 rounded-lg border border-purple-500/10"
          role="note"
        >
          <ShieldAlert size={12} className="flex-shrink-0" aria-hidden="true" />
          <span>Use Stripe test card 4242 4242 4242 4242 for sandbox payments.</span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="text-xs text-red-400 font-semibold bg-red-500/5 p-2.5 rounded-lg border border-red-500/10 flex items-center space-x-2"
        >
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe}
        aria-busy={processing}
        className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/10 transition-all focus:ring-2 focus:ring-purple-400 focus:outline-none"
      >
        {processing ? (
          <>
            <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock size={13} className="text-purple-300" aria-hidden="true" />
            <span>Authorize Payment & Settlement</span>
          </>
        )}
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  invoice: Invoice;
  onSuccess: (paymentRef: string) => void;
}

export default function StripePaymentForm({ invoice, onSuccess }: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm invoice={invoice} onSuccess={onSuccess} />
    </Elements>
  );
}
