import { useEffect, useRef, useState } from "react";
import "./AppPreviewCarousel.css";

const SCREENS = [
  {
    label: "Suivi de progression",
    content: <ScreenProgress />,
  },
  {
    label: "Exercices anti-envie",
    content: <ScreenUrgence />,
  },
  {
    label: "Plan Detox 30-60-90",
    content: <ScreenHome />,
  },
  {
    label: "Blocage des déclencheurs",
    content: <ScreenBlocage />,
  },
  {
    label: "Clarté mentale jour après jour",
    content: <ScreenCalendar />,
  },
];

function ScreenProgress() {
  return (
    <div className="apc-screen apc-screen--progress">
      <div className="apc-s-title">Votre Progression</div>
      <div className="apc-circle-wrap">
        <svg viewBox="0 0 100 100" className="apc-circle-svg">
          <circle cx="50" cy="50" r="42" strokeWidth="7" stroke="#1a1a1a" fill="none" />
          <circle
            cx="50" cy="50" r="42" strokeWidth="7"
            stroke="#22c55e" fill="none"
            strokeDasharray="263.9"
            strokeDashoffset="219"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="apc-circle-inner">
          <div className="apc-circle-label">RÉCUPÉRATION</div>
          <div className="apc-circle-pct">17%</div>
          <div className="apc-circle-days">16 JOURS</div>
        </div>
      </div>
      <div className="apc-s-hint">Vous êtes en bonne voie pour arrêter le :</div>
      <div className="apc-date-pill">lundi 13 juillet 2026</div>
      <div className="apc-s-bar-gold">✦ Votre cerveau se reconstruit jour après jour</div>
    </div>
  );
}

function ScreenUrgence() {
  return (
    <div className="apc-screen apc-screen--urgence">
      <div className="apc-urg-header">
        <span className="apc-urg-logo">SØBRE.</span>
        <span className="apc-urg-mode">Mode Urgence</span>
      </div>
      <div className="apc-urg-card">
        <div className="apc-urg-text">TU ES PLUS FORT QUE CETTE ENVIE.</div>
      </div>
      <div className="apc-urg-label">Ce que la rechute t'enlève :</div>
      <div className="apc-urg-cards-row">
        <div className="apc-urg-mini">
          <div className="apc-urg-mini-icon">↘</div>
          <div className="apc-urg-mini-title">Estime de soi</div>
        </div>
        <div className="apc-urg-mini">
          <div className="apc-urg-mini-icon">⚠</div>
          <div className="apc-urg-mini-title">Besoin extrême</div>
        </div>
      </div>
      <div className="apc-urg-btn apc-urg-btn--red">Je sens que je vais rechuter</div>
      <div className="apc-urg-btn apc-urg-btn--gray">⚠ J'ai rechuté</div>
    </div>
  );
}

function ScreenHome() {
  return (
    <div className="apc-screen apc-screen--home">
      <img
        src="https://i.imgur.com/IpxFk4W.jpg"
        alt="Plan Detox 30-60-90"
        className="apc-home-screenshot"
        loading="lazy"
      />
    </div>
  );
}

function ScreenBlocage() {
  return (
    <div className="apc-screen apc-screen--blocage">
      <div className="apc-blk-back">← Blocage &amp; filtres</div>
      <div className="apc-blk-shield">🛡️</div>
      <div className="apc-blk-card">
        <div className="apc-blk-section-title">Modes de protection</div>
        <div className="apc-blk-row">
          <div>
            <div className="apc-blk-toggle-label">Daily Reset</div>
            <div className="apc-blk-toggle-desc">Apps verrouillées jusqu'au reset</div>
          </div>
          <div className="apc-blk-toggle apc-blk-toggle--on" />
        </div>
        <div className="apc-blk-sep" />
        <div className="apc-blk-row">
          <div>
            <div className="apc-blk-toggle-label">Mode Urgence</div>
            <div className="apc-blk-toggle-desc">Bloque 10 minutes</div>
          </div>
          <div className="apc-blk-toggle" />
        </div>
        <div className="apc-blk-sep" />
        <div className="apc-blk-row">
          <div>
            <div className="apc-blk-toggle-label">Bloquer le web adulte</div>
            <div className="apc-blk-toggle-desc">Safari, Chrome...</div>
          </div>
          <div className="apc-blk-toggle" />
        </div>
      </div>
    </div>
  );
}

function ScreenCalendar() {
  const days = ["L","M","M","J","V","S","D"];
  const grid = [
    [null,null,1,2,3,4,5],
    [6,7,8,9,10,11,12],
    [13,14,15,16,17,18,19],
    [20,21,22,23,24,25,26],
    [27,28,29,30,null,null,null],
  ];
  const greenDays = new Set([14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29]);
  return (
    <div className="apc-screen apc-screen--cal">
      <div className="apc-cal-gold">✦ Votre cerveau se reconstruit jour après jour</div>
      <div className="apc-cal-card">
        <div className="apc-cal-nav">
          <span>‹</span>
          <strong>Avril 2026</strong>
          <span>›</span>
        </div>
        <div className="apc-cal-header">
          {days.map((d) => <span key={d} className="apc-cal-dh">{d}</span>)}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="apc-cal-week">
            {week.map((d, di) => (
              <span
                key={di}
                className={`apc-cal-day ${d && greenDays.has(d) ? "is-green" : ""} ${d === 30 ? "is-today" : ""} ${!d ? "is-empty" : ""}`}
              >
                {d ?? ""}
              </span>
            ))}
          </div>
        ))}
        <div className="apc-cal-legend">
          <span><span className="apc-cal-dot apc-cal-dot--green" />Sobre</span>
          <span><span className="apc-cal-dot apc-cal-dot--red" />Rechute</span>
        </div>
      </div>
      <div className="apc-cal-benefits">Vos bénéfices en cours</div>
      <div className="apc-cal-benefit-row">
        <span>💬 Aisance sociale</span>
        <span className="apc-cal-pct">80%</span>
      </div>
    </div>
  );
}

export default function AppPreviewCarousel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={wrapRef} className={`apc-wrap${visible ? " apc-wrap--visible" : ""}`}>
      <h3 className="apc-title">Voici ce que tu vas débloquer immédiatement</h3>
      <p className="apc-sub">Un programme concret pour reprendre le contrôle jour après jour</p>
      <div className="apc-track">
        {SCREENS.map((s, i) => (
          <div key={i} className="apc-item" style={{ transitionDelay: `${i * 60}ms` }}>
            <div className="apc-phone">
              <div className="apc-phone-notch" />
              <div className="apc-phone-body">{s.content}</div>
            </div>
            <div className="apc-item-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
