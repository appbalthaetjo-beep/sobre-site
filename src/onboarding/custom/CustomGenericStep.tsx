import type { CustomProps } from './types';

export function CustomGenericStep({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>
        Etape : {step.customKey.replace(/_/g, ' ')}
      </h1>
      <p style={{ marginBottom: 24 }}>
        (Ecran special <code>{step.customKey}</code> - version web simplifiee
        pour l&apos;instant)
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
