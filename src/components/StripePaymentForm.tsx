import { useState } from "react";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) || ""
);

const ELEMENTS_APPEARANCE: StripeElementsOptions["appearance"] = {
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
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !elementReady || submitting) return;

    onBeforePayment?.();
    setSubmitting(true);

    const returnUrl = `${window.location.origin}/success`;

    try {
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
        return;
      }

      // Unexpected status (e.g. "requires_action", "processing", undefined)
      setSubmitting(false);
      onPaymentError?.("Statut de paiement inattendu. Veuillez réessayer.");
    } catch (err) {
      setSubmitting(false);
      onPaymentError?.(err instanceof Error ? err.message : "Erreur de paiement inattendue");
    }
  };

  const canSubmit = !!stripe && !!elements && elementReady && !submitting;

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement onReady={() => setElementReady(true)} />
      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          marginTop: 16,
          width: "100%",
          minHeight: 52,
          padding: "14px 16px",
          borderRadius: 12,
          border: "none",
          background: submitting ? "#555" : !elementReady ? "#888" : "#facc15",
          color: submitting || !elementReady ? "#ccc" : "#000",
          fontWeight: 700,
          fontSize: 16,
          cursor: !canSubmit ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {submitting ? "Traitement en cours..." : !elementReady ? "Chargement..." : "Activer l'abonnement"}
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
