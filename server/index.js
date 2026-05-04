import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac, timingSafeEqual } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

console.log("Stripe key loaded ?", !!process.env.STRIPE_SECRET_KEY);

const app = express();
const DEFAULT_CLIENT_URL = "http://localhost:5173";
const allowedOrigins = new Set([process.env.CLIENT_URL, DEFAULT_CLIENT_URL, "http://127.0.0.1:5173"].filter(Boolean));

function isDevLocalOrigin(origin) {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      // Dev convenience: Vite may pick another port (5174, 5175, ...).
      if (process.env.NODE_ENV !== "production" && isDevLocalOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin not allowed: ${origin}`));
    },
  }),
);
app.use(express.json());

console.log("index.js loaded");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY manquante dans server/.env");
  process.exit(1);
}

if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes("your-project.supabase.co")) {
  console.error(
    "SUPABASE_URL invalide. Mets une vraie URL Supabase dans server/.env (pas 'https://your-project.supabase.co')."
  );
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your_service_role_key")) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY invalide. Mets une vraie service role key dans server/.env (pas 'your_service_role_key')."
  );
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SANDBOX_DEFAULT_USER_ID = String(process.env.SANDBOX_DEFAULT_USER_ID || "sbx_user_123").trim();
const ALLOW_SANDBOX_CHECKOUT = String(process.env.ALLOW_SANDBOX_CHECKOUT || "").trim().toLowerCase() === "true";
const SUPABASE_URL = String(process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

app.get("/", (req, res) => res.send("OK"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

function secureEquals(left, right) {
  if (left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function isSandboxAppUserId(userId) {
  return String(userId || "").trim() === SANDBOX_DEFAULT_USER_ID;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function findSupabaseUserByEmail(email) {
  if (!supabaseAdmin) throw new Error("Supabase admin non configure");

  const targetEmail = normalizeEmail(email);

  const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users`);
  url.searchParams.set("filter", targetEmail);
  url.searchParams.set("per_page", "1");

  const resp = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!resp.ok) throw new Error(`GoTrue listUsers error: ${resp.status}`);
  const data = await resp.json();
  const users = data?.users || [];
  return users.find((u) => normalizeEmail(u.email) === targetEmail) || null;
}

async function getOrCreateSupabaseUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new Error("email manquant");
  if (!supabaseAdmin) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante");

  const existingUser = await findSupabaseUserByEmail(normalizedEmail);
  if (existingUser) return existingUser;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: false,
  });
  if (error) throw error;

  const createdUser = data?.user;
  if (!createdUser?.id) throw new Error("Creation du user Supabase impossible");
  return createdUser;
}

function getPriceId({ plan, offer }) {
  if (plan === "week"  && offer === "50") return process.env.PRICE_WEEK_50;
  if (plan === "week"  && offer === "60") return process.env.PRICE_WEEK_60;
  if (plan === "month" && offer === "50") return process.env.PRICE_MONTH_50;
  if (plan === "month" && offer === "60") return process.env.PRICE_MONTH_60;
  if (plan === "year"  && offer === "50") return process.env.PRICE_YEAR_50;
  if (plan === "year"  && offer === "60") return process.env.PRICE_YEAR_60;
  return null;
}

function getSignatureSecret() {
  return String(process.env.USER_ID_SIGNATURE_SECRET || "").trim();
}

function getSignatureMaxAgeSeconds() {
  const value = Number(process.env.USER_ID_SIGNATURE_MAX_AGE_SECONDS || 1800);
  if (!Number.isFinite(value) || value <= 0) return 1800;
  return Math.floor(value);
}

function buildUserIdSignature({ userId, userIdTs, signatureSecret }) {
  const payload = `${userId}.${userIdTs}`;
  return createHmac("sha256", signatureSecret).update(payload).digest("hex");
}

function isTrustedUserId({ userId, userIdTs, userIdSig }) {
  const signatureSecret = getSignatureSecret();
  if (!signatureSecret) return true;

  const ts = Number(userIdTs);
  if (!Number.isFinite(ts)) return false;

  const now = Math.floor(Date.now() / 1000);
  const maxAge = getSignatureMaxAgeSeconds();
  if (ts > now + 60) return false;
  if (now - ts > maxAge) return false;

  const sig = String(userIdSig || "").trim().toLowerCase();
  if (!sig) return false;

  const expected = buildUserIdSignature({
    userId: String(userId),
    userIdTs: String(Math.floor(ts)),
    signatureSecret,
  });

  return secureEquals(sig, expected);
}

function buildSignedFunnelUrl({ userId, step }) {
  const signatureSecret = getSignatureSecret();
  if (!signatureSecret) return null;

  const userIdTs = String(Math.floor(Date.now() / 1000));
  const userIdSig = buildUserIdSignature({ userId, userIdTs, signatureSecret });
  const funnelBase = String(process.env.FUNNEL_BASE_URL || process.env.CLIENT_URL || DEFAULT_CLIENT_URL).replace(
    /\/+$/,
    "",
  );
  const funnelStep = String(step || "trial-reminder").trim() || "trial-reminder";
  const url = `${funnelBase}/start-first5?step=${encodeURIComponent(funnelStep)}&userId=${encodeURIComponent(userId)}&userIdTs=${encodeURIComponent(userIdTs)}&userIdSig=${encodeURIComponent(userIdSig)}`;

  return { url, userIdTs, userIdSig };
}

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { email, plan, offer, userId, userIdSig, userIdTs } = req.body;
    const requestedUserId = String(userId || "").trim();
    const appUserIdTs = String(userIdTs || "").trim();
    const appUserIdSig = String(userIdSig || "").trim();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Checkout bloque: email manquant" });
    }

    if (requestedUserId && !isTrustedUserId({ userId: requestedUserId, userIdTs, userIdSig })) {
      return res.status(401).json({ error: "userId non verifie" });
    }

    const supabaseUser = await getOrCreateSupabaseUserByEmail(normalizedEmail);
    const appUserId = String(supabaseUser.id || "").trim();
    if (!appUserId) {
      return res.status(500).json({ error: "Impossible de resoudre le user Supabase pour cet email" });
    }

    if (requestedUserId && requestedUserId !== appUserId) {
      return res.status(409).json({
        error: `Identite incoherente: funnel userId ${requestedUserId} != Supabase user.id ${appUserId}`,
      });
    }

    if (isSandboxAppUserId(appUserId) && !ALLOW_SANDBOX_CHECKOUT) {
      return res.status(400).json({ error: `Checkout bloque: app_user_id sandbox refuse (${SANDBOX_DEFAULT_USER_ID})` });
    }

    const priceId = getPriceId({ plan, offer });
    if (!priceId) return res.status(400).json({ error: "Price ID introuvable" });

    const clientUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
    const cancelParams = new URLSearchParams({ step: "trial-reminder", userId: appUserId });
    if (appUserIdTs && appUserIdSig) {
      cancelParams.set("userIdTs", appUserIdTs);
      cancelParams.set("userIdSig", appUserIdSig);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: appUserId,
      customer_email: normalizedEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/start-first5?${cancelParams.toString()}`,
      metadata: { plan, offer, app_user_id: appUserId, auth_email: normalizedEmail },
      subscription_data: {
        metadata: { app_user_id: appUserId, auth_email: normalizedEmail },
      },
    });

    res.json({ url: session.url, app_user_id: appUserId, auth_email: normalizedEmail });
  } catch (e) {
    console.error("Stripe error:", e);
    res.status(500).json({ error: e?.message || "Erreur Stripe" });
  }
});

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { email, plan, offer, userId, userIdSig, userIdTs } = req.body;
    const requestedUserId = String(userId || "").trim();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ error: "email manquant" });
    }

    if (requestedUserId && !isTrustedUserId({ userId: requestedUserId, userIdTs, userIdSig })) {
      return res.status(401).json({ error: "userId non verifie" });
    }

    const supabaseUser = await getOrCreateSupabaseUserByEmail(normalizedEmail);
    const appUserId = String(supabaseUser.id || "").trim();
    if (!appUserId) {
      return res.status(500).json({ error: "Impossible de resoudre le user Supabase pour cet email" });
    }

    if (requestedUserId && requestedUserId !== appUserId) {
      return res.status(409).json({
        error: `Identite incoherente: funnel userId ${requestedUserId} != Supabase user.id ${appUserId}`,
      });
    }

    if (isSandboxAppUserId(appUserId) && !ALLOW_SANDBOX_CHECKOUT) {
      return res.status(400).json({ error: `Checkout bloque: app_user_id sandbox refuse (${SANDBOX_DEFAULT_USER_ID})` });
    }

    const priceId = getPriceId({ plan, offer });
    console.log("[create-payment-intent] plan:", plan, "offer:", offer, "priceId:", priceId);
    if (!priceId) return res.status(400).json({ error: "Price ID introuvable" });

    const existingCustomers = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
    const stripeCustomer =
      existingCustomers.data.length > 0
        ? existingCustomers.data[0]
        : await stripe.customers.create({
            email: normalizedEmail,
            metadata: { app_user_id: appUserId, auth_email: normalizedEmail },
          });

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { app_user_id: appUserId, auth_email: normalizedEmail, plan, offer },
    });

    const invoice = subscription.latest_invoice;
    if (typeof invoice !== "object" || !invoice) {
      return res.status(500).json({ error: "Facture Stripe introuvable" });
    }
    const paymentIntent = invoice.payment_intent;
    if (typeof paymentIntent !== "object" || !paymentIntent?.client_secret) {
      return res.status(500).json({ error: "PaymentIntent introuvable dans la facture" });
    }

    res.json({
      client_secret: paymentIntent.client_secret,
      subscription_id: subscription.id,
      customer_id: stripeCustomer.id,
      app_user_id: appUserId,
      auth_email: normalizedEmail,
    });
  } catch (e) {
    console.error("Stripe payment intent error:", e);
    res.status(500).json({ error: e?.message || "Erreur Stripe" });
  }
});

app.get("/api/stripe/payment-intent", async (req, res) => {
  try {
    const paymentIntentId = String(req.query.payment_intent_id || "");
    if (!paymentIntentId) return res.status(400).json({ error: "payment_intent_id manquant" });

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["invoice.subscription", "customer"],
    });

    const isValidated = pi.status === "succeeded";
    const invoiceObj = typeof pi.invoice === "object" ? pi.invoice : null;
    const subscriptionObj =
      invoiceObj && typeof invoiceObj.subscription === "object" ? invoiceObj.subscription : null;
    const customerObj = typeof pi.customer === "object" ? pi.customer : null;

    res.json({
      id: pi.id,
      status: pi.status,
      is_validated: isValidated,
      app_user_id: String(subscriptionObj?.metadata?.app_user_id || "").trim() || null,
      // receipt_email peut être null sur les abonnements ; fallback sur customer.email
      customer_email: pi.receipt_email || customerObj?.email || null,
      subscription_id: subscriptionObj?.id || null,
    });
  } catch (e) {
    if (e?.type === "StripeInvalidRequestError") {
      return res.status(404).json({ error: "PaymentIntent Stripe introuvable" });
    }
    console.error("Stripe payment intent retrieve error:", e);
    res.status(500).json({ error: "Erreur recuperation PaymentIntent Stripe" });
  }
});

app.post("/api/funnel/signed-url", (req, res) => {
  try {
    const signerApiKey = String(req.header("x-funnel-signer-key") || "").trim();
    const expectedSignerApiKey = String(process.env.FUNNEL_SIGNER_API_KEY || "").trim();
    if (!expectedSignerApiKey) {
      return res.status(500).json({ error: "FUNNEL_SIGNER_API_KEY manquante" });
    }

    if (!signerApiKey || !secureEquals(signerApiKey, expectedSignerApiKey)) {
      return res.status(401).json({ error: "acces refuse" });
    }

    const userId = String(req.body?.userId || "").trim();
    const step = String(req.body?.step || "trial-reminder").trim();
    if (!userId) return res.status(400).json({ error: "userId manquant" });

    const signed = buildSignedFunnelUrl({ userId, step });
    if (!signed) return res.status(500).json({ error: "USER_ID_SIGNATURE_SECRET manquante" });

    res.json({
      url: signed.url,
      expires_in_seconds: getSignatureMaxAgeSeconds(),
    });
  } catch (e) {
    console.error("Signed funnel URL error:", e);
    res.status(500).json({ error: "Erreur generation URL signee" });
  }
});

app.get("/api/stripe/session", async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || "");
    if (!sessionId) return res.status(400).json({ error: "session_id manquant" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
    const isValidated = session.status === "complete" && session.payment_status === "paid";

    res.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      is_validated: isValidated,
      app_user_id:
        String(session.metadata?.app_user_id || "").trim() ||
        (typeof session.subscription === "object" ? String(session.subscription?.metadata?.app_user_id || "").trim() : null) ||
        null,
      customer_email: session.customer_details?.email || null,
      subscription_id: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null,
    });
  } catch (e) {
    if (e?.type === "StripeInvalidRequestError") {
      return res.status(404).json({ error: "Session Stripe introuvable" });
    }
    console.error("Stripe session retrieve error:", e);
    res.status(500).json({ error: "Erreur recuperation session Stripe" });
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
      return res.status(resp.status).json({ error: "Erreur recuperation subscription PayPal", details: json });
    }

    res.json({
      id: json.id || null,
      status: json.status || null,
      plan_id: json.plan_id || null,
      subscriber_email: json.subscriber?.email_address || null,
    });
  } catch (e) {
    console.error("PayPal subscription retrieve error:", e);
    res.status(500).json({ error: "Erreur PayPal" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4242;
console.log("BOOT OK - going to listen on", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Stripe server running on http://localhost:${PORT}`);
});
