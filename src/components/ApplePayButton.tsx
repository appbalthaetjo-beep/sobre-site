import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = "pk_test_51T5BaoFkWHd4X5DeqHuvcNKMzDnkfrStIyoHaCJHBmttDlTbf6wJRuVSzJaC5h2q8jxADw7xGU1ptw0LcBJsvUq200torerrDL";
export default function ApplePayButton() {
  const ref = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!stripe || !mounted) return;

      const paymentRequest = stripe.paymentRequest({
        country: "FR",
        currency: "eur",
        total: { label: "SOBRE Premium", amount: 999 },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const result = await paymentRequest.canMakePayment();
      if (!mounted) return;

      if (result && ref.current) {
        const elements = stripe.elements();
        const prButton = elements.create("paymentRequestButton", { paymentRequest });
        prButton.mount(ref.current);
        setSupported(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Si Apple Pay/Wallet non dispo, on n'affiche rien
  if (!supported) return null;

  return <div ref={ref} />;
}