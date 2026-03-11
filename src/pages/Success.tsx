import { useEffect, useMemo, useState } from "react";
import { buildTrialReminderUrl } from "../lib/funnelIdentity";

const APP_STORE_URL =
  "https://apps.apple.com/fr/app/sobre-arr%C3%AAte-le-porno/id6751785162?l=en-GB";

type CheckState = "loading" | "success" | "pending" | "error";

type SessionPayload = {
  id?: string;
  status?: string;
  payment_status?: string;
  is_validated?: boolean;
  customer_email?: string | null;
  error?: string;
};

export default function Success() {
  const [state, setState] = useState<CheckState>("loading");
  const [message, setMessage] = useState("Verification du paiement en cours...");
  const [customerEmail, setCustomerEmail] = useState("");
  const trialReminderUrl = useMemo(() => buildTrialReminderUrl(window.location.search), []);

  const sessionId = useMemo(() => {
    return String(new URLSearchParams(window.location.search).get("session_id") || "").trim();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      if (!sessionId) {
        setState("error");
        setMessage("Session absente. Merci de revenir depuis le lien de paiement.");
        return;
      }

      try {
        const API = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:4242").replace(/\/+$/, "");
        const res = await fetch(`${API}/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`);
        const data = (await res.json().catch(() => ({}))) as SessionPayload;
        if (cancelled) return;

        if (!res.ok || !data?.id) {
          setState("error");
          setMessage(data?.error || "Impossible de verifier cette session Stripe.");
          return;
        }

        if (data.is_validated) {
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
  }, [sessionId]);

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
