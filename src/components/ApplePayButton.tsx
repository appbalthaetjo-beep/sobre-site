import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export default function ApplePayButton() {
  const ref = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
      if (!key) return;
      const stripe = await loadStripe(key);
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
