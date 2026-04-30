import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) || ""
);

const ELEMENTS_APPEARANCE: Parameters<typeof Elements>[0]["options"]["appearance"] = {
  theme: "night",
  variables: {
    colorPrimary: "#facc15",
    colorBackground: "#1a1a1a",
    colorText: "#ffffff",
    colorDanger: "#ff6b6b",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(255,255,255,0.15)", padding: "12px" },
    ".Label": { color: "rgba(255,255,255,0.7)", marginBottom: "6px" },
  },
};

type InnerProps = {
  onBeforePayment?: () => void;
  onPaymentError?: (msg: string) => void;
};

function PaymentFormInner({ onBeforePayment, onPaymentError }: InnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    onBeforePayment?.();
    setSubmitting(true);

    const returnUrl = `${window.location.origin}/success`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (error) {
      setSubmitting(false);
      onPaymentError?.(error.message || "Erreur de paiement");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      window.location.href = `${returnUrl}?payment_intent=${paymentIntent.id}`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        style={{
          marginTop: 16,
          width: "100%",
          minHeight: 52,
          padding: "14px 16px",
          borderRadius: 12,
          border: "none",
          background: submitting ? "#555" : "#facc15",
          color: submitting ? "#ccc" : "#000",
          fontWeight: 700,
          fontSize: 16,
          cursor: submitting ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {submitting ? "Traitement en cours..." : "Activer l'abonnement"}
      </button>
    </form>
  );
}

type Props = {
  clientSecret: string;
  onBeforePayment?: () => void;
  onPaymentError?: (msg: string) => void;
};

// APPLE PAY — aucun code supplémentaire requis ici : PaymentElement active Apple Pay
// automatiquement quand disponible. Prérequis : enregistrer le domaine de production
// (sobreapp.online) dans Stripe Dashboard → Settings → Payment methods → Apple Pay →
// Add new domain. Sans ça, Apple Pay ne s'affichera pas sur Safari/iOS.
export function StripePaymentForm({ clientSecret, onBeforePayment, onPaymentError }: Props) {
  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, locale: "fr", appearance: ELEMENTS_APPEARANCE }}
    >
      <PaymentFormInner onBeforePayment={onBeforePayment} onPaymentError={onPaymentError} />
    </Elements>
  );
}
