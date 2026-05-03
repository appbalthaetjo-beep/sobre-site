import { useState } from 'react';
import type { CustomProps } from './types';

const symptomsByCategory = {
  Mental: [
    '💤 Se sentir démotivé',
    '🎯 Manque d’ambition pour poursuivre des objectifs',
    '🎯 Difficulté à se concentrer',
    '🧠 Mauvaise mémoire / “brouillard mental”',
    '😰 Anxiété générale',
    '😮‍💨 Fatigue et léthargie',
  ],
  Physique: [
    '💓 Faible désir sexuel',
    '🍆 Érections faibles sans pornographie',
    '🧩 Rapports sexuels insatisfaisants ou sans plaisir',
  ],
  Social: [
    '💔 Faible confiance en soi',
    '🪞 Se sentir peu attirant ou indigne d’amour',
    '💬 Désir réduit de socialiser',
    '😔 Se sentir isolé des autres',
  ],
  Foi: ['🙏 Se sentir éloigné de Dieu'],
} as const;

export function CustomSymptomsMultiSelect({
  step,
  answers,
  setAnswers,
  goNext,
}: CustomProps) {
  const initial = String(answers.symptoms ?? '')
    .split('||')
    .filter(Boolean);
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>
        As-tu remarqué certains de ces symptômes récemment ?
      </h1>
      <p style={{ marginBottom: 16, color: '#444' }}>
        Sélectionne tout ce qui te parle.
      </p>
      {Object.entries(symptomsByCategory).map(([category, items]) => (
        <section key={category} style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>{category}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((item) => {
              const active = selected.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  style={{
                    textAlign: 'left',
                    borderRadius: 10,
                    border: `1px solid ${active ? '#111' : '#ddd'}`,
                    background: active ? '#f0f0f0' : '#fff',
                    padding: '10px 12px',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <button
        style={{
          padding: '12px 16px',
          borderRadius: 999,
          border: 'none',
          background: 'black',
          color: 'white',
          cursor: step.nav?.next ? 'pointer' : 'not-allowed',
          opacity: step.nav?.next ? 1 : 0.6,
        }}
        onClick={() => {
          setAnswers((prev) => ({
            ...prev,
            symptoms: selected.join('||'),
          }));
          goNext();
        }}
        disabled={!step.nav?.next}
      >
        Continuer
      </button>
    </div>
  );
}
