import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
const DEFAULT_CLIENT_URL = "http://localhost:5173";
const allowedOrigins = new Set(
  [process.env.CLIENT_URL, DEFAULT_CLIENT_URL, "http://127.0.0.1:5173"].filter(Boolean),
);
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / curl / server-to-server calls
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin not allowed: ${origin}`));
    },
  }),
);
app.use(express.json());

console.log("✅ index.js loaded");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY manquante dans server/.env");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.get("/", (req, res) => res.send("OK"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

function getPriceId({ plan, offer }) {
  if (plan === "month" && offer === "50") return process.env.PRICE_MONTH_50;
  if (plan === "month" && offer === "60") return process.env.PRICE_MONTH_60;
  if (plan === "year" && offer === "50") return process.env.PRICE_YEAR_50;
  if (plan === "year" && offer === "60") return process.env.PRICE_YEAR_60;
  return null;
}

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { plan, offer } = req.body;

    const priceId = getPriceId({ plan, offer });
    if (!priceId) return res.status(400).json({ error: "Price ID introuvable" });

    const clientUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/pricing?canceled=1`,
      metadata: { plan, offer },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("❌ Stripe error:", e);
    res.status(500).json({ error: "Erreur Stripe" });
  }
});

app.get("/api/stripe/session", async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || "");
    if (!sessionId) return res.status(400).json({ error: "session_id manquant" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    res.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || null,
      subscription_id: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null,
    });
  } catch (e) {
    console.error("❌ Stripe session retrieve error:", e);
    res.status(500).json({ error: "Erreur récupération session Stripe" });
  }
});

function getPayPalApiBaseUrl() {
  const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
  return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET manquants dans server/.env");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const resp = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`PayPal token error: ${resp.status} ${JSON.stringify(json)}`);
  }
  if (!json?.access_token) throw new Error("PayPal token: access_token manquant");
  return json.access_token;
}

app.get("/api/paypal/subscription", async (req, res) => {
  try {
    const subscriptionId = String(req.query.subscription_id || "");
    if (!subscriptionId) return res.status(400).json({ error: "subscription_id manquant" });

    const token = await getPayPalAccessToken();
    const resp = await fetch(`${getPayPalApiBaseUrl()}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(resp.status).json({ error: "Erreur récupération subscription PayPal", details: json });
    }

    res.json({
      id: json.id || null,
      status: json.status || null,
      plan_id: json.plan_id || null,
      subscriber_email: json.subscriber?.email_address || null,
    });
  } catch (e) {
    console.error("❌ PayPal subscription retrieve error:", e);
    res.status(500).json({ error: "Erreur PayPal" });
  }
});

const PORT = process.env.PORT || 4242;
console.log("✅ BOOT OK - going to listen on", PORT);

app.listen(PORT, () => {
  console.log(`✅ Stripe server running on http://localhost:${PORT}`);
});
