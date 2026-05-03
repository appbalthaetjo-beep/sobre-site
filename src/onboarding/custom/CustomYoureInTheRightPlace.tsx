import type { CSSProperties } from 'react';
import type { CustomProps } from './types';

export function CustomYoureInTheRightPlace({ step, goNext }: CustomProps) {
  const cardStyle: CSSProperties = {
    border: '1px solid #e7e7e7',
    borderRadius: 14,
    padding: '12px 14px',
    marginBottom: 10,
    background: '#fafafa',
  };

  return (
    <div>
      <div style={cardStyle}>
        <strong>🧠 Comprendre vos déclencheurs</strong>
        <p style={{ marginTop: 8, color: '#444', lineHeight: 1.45 }}>
          On va identifier ce qui vous pousse vers la pornographie, pour casser
          le cycle à la racine.
        </p>
      </div>
      <div style={cardStyle}>
        <strong>⚡ Retrouver le contrôle</strong>
        <p style={{ marginTop: 8, color: '#444', lineHeight: 1.45 }}>
          Des outils simples et concrets pour réduire les envies et reprendre la
          main, jour après jour.
        </p>
      </div>
      <div style={cardStyle}>
        <strong>Votre objectif</strong>
        <p style={{ marginTop: 8, color: '#444', lineHeight: 1.45 }}>
          Vivre sans porno, avec intégrité
        </p>
        <p style={{ marginTop: 8, color: '#444', lineHeight: 1.45 }}>
          Beaucoup commencent exactement ici.
        </p>
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 10, marginTop: 16 }}>
        Vous êtes au bon endroit
      </h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Des milliers de personnes ont commencé avec les mêmes difficultés. Le
        diagnostic qui suit va clarifier votre situation et vous montrer la
        prochaine étape.
      </p>
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
        onClick={goNext}
        disabled={!step.nav?.next}
      >
        Continuer
      </button>
    </div>
  );
}
