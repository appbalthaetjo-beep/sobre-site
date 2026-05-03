import { useEffect, useRef, useState } from "react";
import "./TrustpilotReviews.css";


const REVIEWS = [
  {
    quote: "Le bouton d'urgence m'a évité plusieurs rechutes. C'est simple, ça marche vraiment dans le moment.",
    author: "Thomas",
    age: 29,
    days: "3 semaines",
  },
  {
    quote: "Pour la première fois j'ai une méthode concrète. Le suivi quotidien me force à rester honnête avec moi-même.",
    author: "Mehdi",
    age: 22,
    days: "1 mois",
  },
] as const;

function TrustpilotRating() {
  return (
    <img
      src="https://i.imgur.com/znZrhfk.png"
      alt="5 étoiles Trustpilot"
      className="tpr-rating-img"
      loading="lazy"
    />
  );
}

function Stars({ size = 18 }: { size?: number }) {
  return (
    <div className="tpr-stars" aria-label="5 étoiles sur 5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="tpr-star">
          <path d="M12 2l2.9 6.3L22 9.3l-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l7.1-1z" />
        </svg>
      ))}
    </div>
  );
}

function TrustpilotLogo() {
  return (
    <div className="tpr-logo" aria-label="Trustpilot">
      <svg className="tpr-logo-star" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l2.9 6.3L22 9.3l-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l7.1-1z" />
      </svg>
      <span className="tpr-logo-word">Trustpilot</span>
    </div>
  );
}

export default function TrustpilotReviews() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={wrapRef} className={`tpr-wrap${visible ? " tpr-wrap--visible" : ""}`}>

      {/* ── Trustpilot logo + badge ── */}
      <div className="tpr-badge-row">
        <TrustpilotLogo />
        <div className="tpr-badge-sep" />
        <div className="tpr-badge-score">
          <Stars size={16} />
          <span className="tpr-badge-label"><strong>4,8 / 5</strong> · +5 000 utilisateurs</span>
        </div>
      </div>

      <div className="tpr-header">
        <h3 className="tpr-title">Ils avancent avec SOBRE</h3>
        <p className="tpr-sub">Des utilisateurs reprennent le contrôle chaque jour</p>
      </div>

      {/* ── Pierre : featured testimonial ── */}
      <div className="tpr-pierre">
        <div className="tpr-review-header">
          <TrustpilotRating />
          <span className="tpr-review-name">Pierre</span>
        </div>
        <blockquote className="tpr-pierre-quote">
          "16 jours sans rechute. L'app me montre chaque jour que j'avance — c'est ce dont j'avais besoin pour tenir."
        </blockquote>
        <footer className="tpr-pierre-footer">
          <span className="tpr-pierre-meta">27 ans · 16 jours</span>
        </footer>
      </div>

      {/* ── Thomas & Mehdi : flat, sans carte ── */}
      <div className="tpr-reviews-row">
        {REVIEWS.map(({ quote, author, age, days }, i) => (
          <article
            key={i}
            className="tpr-review"
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <div className="tpr-review-header">
              <TrustpilotRating />
              <span className="tpr-review-name">{author}</span>
            </div>
            <blockquote className="tpr-review-quote">"{quote}"</blockquote>
            <footer className="tpr-review-author">
              <span className="tpr-review-meta">{age} ans · {days}</span>
            </footer>
          </article>
        ))}
      </div>

    </section>
  );
}
