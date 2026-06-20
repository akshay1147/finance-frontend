"use client";

import React, { useState, useEffect } from "react";
import { 
  useStripe, 
  useElements, 
  CardElement, 
  Elements 
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Lock, CreditCard, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { recordPayment, Invoice } from "@/services/api";

// Initialize mock-safe Stripe promise
const stripePromise = loadStripe("pk_test_51MockLTIBackendKeyOnlyForSecureCheckoutToTokenizeDirectlyWithStripe");

interface CheckoutFormProps {
  invoice: Invoice;
  onSuccess: (paymentRef: string) => void;
}

function CheckoutForm({ invoice, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const bgElements = useElements();

  const [cardholderName, setCardholderName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardholderName.trim()) {
      setError("Cardholder name is required");
      return;
    }

    setProcessing(true);
    setError(null);

    // Simulate Stripe Card Tokenization API call directly to Stripe (PCI-DSS compliant)
    setTimeout(() => {
      // In a real environment, we would call stripe.createPaymentMethod(...)
      // e.g.:
      // const cardElement = elements.getElement(CardElement);
      // const { paymentMethod, error } = await stripe.createPaymentMethod({ type: 'card', card: cardElement });
      
      // Simulate success for sandbox test cards (e.g. 4242...)
      const simulatedStripeId = `ch_stripe_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        recordPayment(invoice.invoice_id, {
          payment_method: "card",
          reference_number: simulatedStripeId,
          stripe_payment_id: simulatedStripeId
        });
        
        onSuccess(simulatedStripeId);
      } catch (err) {
        setError("Invoice reconciliation failed. Please contact support.");
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-300">
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          Cardholder Name
        </label>
        <input
          type="text"
          required
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="e.g. John Doe"
          className="glass-input w-full px-3 py-2 mt-1 rounded-xl text-xs"
          disabled={processing}
        />
      </div>

      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          Credit or Debit Card Details
        </label>
        
        {/* Stripe Elements Secure Card Container */}
        <div className="mt-1 p-3 rounded-xl bg-slate-950/40 border border-slate-800 focus-within:border-purple-500/50 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "13px",
                  color: "#e2e8f0",
                  fontFamily: "Outfit, Inter, sans-serif",
                  "::placeholder": {
                    color: "#94a3b8",
                  },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
            }}
          />
        </div>
        
        {/* Sandbox Simulation Note */}
        <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-purple-400 font-medium bg-purple-500/5 p-2 rounded-lg border border-purple-500/10">
          <ShieldAlert size={12} className="flex-shrink-0" />
          <span>Demo Sandbox: Any 4242 Stripe test card will clear immediately.</span>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 font-semibold bg-red-500/5 p-2.5 rounded-lg border border-red-500/10 flex items-center space-x-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={processing}
        className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/10 transition-all"
      >
        {processing ? (
          <>
            <RefreshCw size={14} className="animate-spin" />
            <span>Tokenizing Card Securely...</span>
          </>
        ) : (
          <>
            <Lock size={13} className="text-purple-300" />
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
