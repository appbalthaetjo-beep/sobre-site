import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

type Plan = "month" | "year";
type Offer = "50" | "60";

function getPlanId(plan: Plan, offer: Offer): string | null {
  const env = import.meta.env;
  if (plan === "month" && offer === "50") return env.VITE_PAYPAL_PLAN_MONTH_50 || null;
  if (plan === "month" && offer === "60") return env.VITE_PAYPAL_PLAN_MONTH_60 || null;
  if (plan === "year" && offer === "50") return env.VITE_PAYPAL_PLAN_YEAR_50 || null;
  if (plan === "year" && offer === "60") return env.VITE_PAYPAL_PLAN_YEAR_60 || null;
  return null;
}

export default function PayPalSubscriptionButtons({
  plan,
  offer,
  onApproved,
}: {
  plan: Plan;
  offer: Offer;
  onApproved?: (subscriptionId: string) => void;
}) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
  const planId = getPlanId(plan, offer);

  if (!clientId) {
    return <div style={{ color: "#fff", opacity: 0.85 }}>PayPal non configuré (VITE_PAYPAL_CLIENT_ID).</div>;
  }
  if (!planId) {
    return <div style={{ color: "#fff", opacity: 0.85 }}>Plan PayPal manquant pour {plan}/{offer}.</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        intent: "subscription",
        vault: true,
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", label: "subscribe" }}
        createSubscription={(_, actions) => {
          return actions.subscription.create({ plan_id: planId });
        }}
        onApprove={(data) => {
          const id = String((data as any).subscriptionID || "");
          if (id) onApproved?.(id);
        }}
      />
    </PayPalScriptProvider>
  );
}

