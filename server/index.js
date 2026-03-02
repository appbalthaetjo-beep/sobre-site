import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

console.log("✅ index.js loaded");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY manquante dans server/.env");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.get("/", (req, res) => res.send("OK"));

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=1`,
      metadata: { plan, offer },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("❌ Stripe error:", e);
    res.status(500).json({ error: "Erreur Stripe" });
  }
});

const PORT = process.env.PORT || 4242;
console.log("✅ BOOT OK - going to listen on", PORT);

app.listen(PORT, () => {
  console.log(`✅ Stripe server running on http://localhost:${PORT}`);
});