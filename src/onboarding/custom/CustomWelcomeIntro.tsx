import type { CustomProps } from './types';

export function CustomWelcomeIntro({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Bienvenue !</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Commençons par déterminer si vous avez un problème avec la pornographie.
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
