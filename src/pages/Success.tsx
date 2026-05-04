import { useEffect, useMemo, useState } from "react";
import { usePostHog } from "@posthog/react";
import { getApiBaseUrl } from "../lib/apiBaseUrl";
import { buildTrialReminderUrl } from "../lib/funnelIdentity";
import { clearPendingPurchase, readPendingPurchase, trackMetaEventOnce } from "../lib/metaPixel";
import { capturePostHogEventOnce, clearPendingCheckout, readPendingCheckout } from "../lib/posthog";

const FLOW_VERSION = "email_step_v1";
const withFlowVersion = (properties?: Record<string, string | number | boolean | null | undefined>) => ({
  ...(properties ?? {}),
  flow_version: FLOW_VERSION,
});

const APP_STORE_URL =
  "https://apps.apple.com/fr/app/sobre-arr%C3%AAte-le-porno/id6751785162?l=en-GB";

type CheckState = "loading" | "success" | "pending" | "error";

type VerifyPayload = {
  id?: string;
  status?: string;
  payment_status?: string;
  is_validated?: boolean;
  customer_email?: string | null;
  error?: string;
};

export default function Success() {
  const posthog = usePostHog();
  const [state, setState] = useState<CheckState>("loading");
  const [message, setMessage] = useState("Verification du paiement en cours...");
  const [customerEmail, setCustomerEmail] = useState("");
  const trialReminderUrl = useMemo(() => buildTrialReminderUrl(window.location.search), []);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = useMemo(() => String(params.get("session_id") || "").trim(), [params]);
  const paymentIntentId = useMemo(() => String(params.get("payment_intent") || "").trim(), [params]);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      const verifyId = paymentIntentId || sessionId;
      if (!verifyId) {
        setState("error");
        setMessage("Session absente. Merci de revenir depuis le lien de paiement.");
        return;
      }

      try {
        const API_BASE_URL = getApiBaseUrl();
        const endpoint = paymentIntentId
          ? `${API_BASE_URL}/api/stripe/payment-intent?payment_intent_id=${encodeURIComponent(paymentIntentId)}`
          : `${API_BASE_URL}/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`;
        const res = await fetch(endpoint);
        const data = (await res.json().catch(() => ({}))) as VerifyPayload;
        if (cancelled) return;

        if (!res.ok || !data?.id) {
          setState("error");
          setMessage(data?.error || "Impossible de verifier cette session Stripe.");
          return;
        }

        if (data.is_validated) {
          const eventId = paymentIntentId || sessionId;
          const pendingPurchase = readPendingPurchase();
          const pendingCheckout = readPendingCheckout();
          const wasPurchaseTrackedBeforeRedirect =
            !!paymentIntentId && sessionStorage.getItem(`sobre_meta_purchase_tracked:${paymentIntentId}`) === "1";
          if (!wasPurchaseTrackedBeforeRedirect) {
            trackMetaEventOnce(`Purchase:${eventId}`, "Purchase", {
              content_name: "SOBRE Premium",
              content_type: "product",
              currency: "EUR",
              value: pendingPurchase?.value ?? 0,
            });
          }
          if (paymentIntentId) {
            sessionStorage.removeItem(`sobre_meta_purchase_tracked:${paymentIntentId}`);
          }
          clearPendingPurchase();
          capturePostHogEventOnce(
            posthog,
            `purchase_completed:${eventId}`,
            "purchase_completed",
            withFlowVersion({
              currency: pendingCheckout?.currency ?? "EUR",
              offer_name: pendingCheckout?.offerName ?? "intro_50",
              plan_type: pendingCheckout?.planType,
              price: pendingCheckout?.price ?? 0,
            })
          );
          clearPendingCheckout();
          setState("success");
          setMessage("Paiement confirme. Ton abonnement est actif.");
          setCustomerEmail(String(data.customer_email || "").trim());
          return;
        }

        setState("pending");
        setMessage("Paiement non confirme pour le moment. Recharge cette page dans quelques instants.");
      } catch {
        if (cancelled) return;
        setState("error");
        setMessage("Erreur reseau pendant la verification du paiement.");
      }
    };

    void verifySession();
    return () => {
      cancelled = true;
    };
  }, [posthog, sessionId, paymentIntentId]);

  useEffect(() => {
    const eventId = paymentIntentId || sessionId;
    capturePostHogEventOnce(
      posthog,
      `success_viewed:${eventId || "unknown"}`,
      "success_viewed",
      withFlowVersion({
        session_id: sessionId || null,
        payment_intent_id: paymentIntentId || null,
      })
    );
  }, [posthog, sessionId, paymentIntentId]);

  const kicker =
    state === "success"
      ? "Paiement confirme"
      : state === "pending"
        ? "Verification en attente"
        : state === "loading"
          ? "Verification en cours"
          : "Verification echouee";

  const title =
    state === "success"
      ? "Bienvenue sur Sobre Premium"
      : state === "pending"
        ? "Confirmation du paiement en cours"
        : state === "loading"
          ? "Verification de ta session Stripe"
          : "Impossible de confirmer ton paiement";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <img
            src="https://i.imgur.com/stMR5rL.png"
            alt="Sobre"
            className="h-11 w-auto object-contain"
            draggable={false}
          />
        </div>

        <p
          className={`text-sm uppercase tracking-[0.18em] ${state === "success" ? "text-green-300/90" : "text-yellow-200/90"}`}
        >
          {kicker}
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-white/70">
          {state === "success"
            ? "Telechargez l'app et connectez-vous avec l'email du paiement."
            : message}
        </p>

        {state === "success" ? (
          <>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Email du paiement</p>
              <p className="mt-2 text-base font-medium text-white">
                {customerEmail ? `Vous avez paye avec ${customerEmail}` : "Email non disponible"}
              </p>
              <p className="mt-2 text-sm text-white/65">
                Utilisez cette adresse pour vous connecter dans l'app.
              </p>
            </div>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 text-base font-semibold text-black transition-colors hover:bg-yellow-300"
            >
              Telecharger l'app
            </a>
          </>
        ) : (
          <a
            href={trialReminderUrl}
            className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Retourner au paiement
          </a>
        )}
      </div>
    </div>
  );
}
