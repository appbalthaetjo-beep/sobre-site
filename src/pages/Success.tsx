import { useEffect, useMemo, useState } from "react";

type StripeSessionInfo = {
  id: string;
  status: string | null;
  payment_status: string | null;
  customer_email: string | null;
  subscription_id: string | null;
};

type PayPalSubscriptionInfo = {
  id: string | null;
  status: string | null;
  plan_id: string | null;
  subscriber_email: string | null;
};

function getApiBase() {
  const API = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return String(API || "http://localhost:4242").replace(/\/+$/, "");
}

export default function Success() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = params.get("session_id");
  const paypalSubscriptionId = params.get("paypal_subscription_id");

  const [loading, setLoading] = useState(true);
  const [stripe, setStripe] = useState<StripeSessionInfo | null>(null);
  const [paypal, setPayPal] = useState<PayPalSubscriptionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const apiBase = getApiBase();

        if (sessionId) {
          const res = await fetch(`${apiBase}/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Erreur Stripe");
          if (!cancelled) setStripe(data);
        } else if (paypalSubscriptionId) {
          const res = await fetch(
            `${apiBase}/api/paypal/subscription?subscription_id=${encodeURIComponent(paypalSubscriptionId)}`,
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Erreur PayPal");
          if (!cancelled) setPayPal(data);
        } else {
          throw new Error("Aucun identifiant de paiement fourni.");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, paypalSubscriptionId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold">Paiement confirmé</h1>
        <p className="mt-2 text-white/70">Merci. Ton abonnement est en cours d’activation.</p>

        {loading && <p className="mt-6 text-white/70">Vérification en cours…</p>}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        )}

        {stripe && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
            <div>Provider: Stripe</div>
            <div>Session: {stripe.id}</div>
            <div>Status: {stripe.status}</div>
            <div>Payment: {stripe.payment_status}</div>
            <div>Email: {stripe.customer_email || "-"}</div>
            <div>Subscription: {stripe.subscription_id || "-"}</div>
          </div>
        )}

        {paypal && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
            <div>Provider: PayPal</div>
            <div>Subscription: {paypal.id || "-"}</div>
            <div>Status: {paypal.status || "-"}</div>
            <div>Plan: {paypal.plan_id || "-"}</div>
            <div>Email: {paypal.subscriber_email || "-"}</div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 text-base font-semibold text-black hover:bg-yellow-300 transition-colors"
          >
            Retour
          </a>
          <a
            href="https://apps.apple.com/fr/app/sobre-arr%C3%AAte-le-porno/id6751785162"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Ouvrir l’app
          </a>
        </div>
      </div>
    </div>
  );
}
