import type { CustomProps } from './types';

export function CustomPornImpactSlider({
  step,
  answers,
  setAnswers,
  goNext,
}: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>
        Quel impact la pornographie a-t-elle sur ta vie ?
      </h1>
      <p style={{ marginBottom: 16, color: '#444' }}>
        Fais glisser le curseur entre « Nuisible » et « Bénéfique ».
      </p>
      <input
        type="range"
        min={0}
        max={4}
        step={1}
        value={Number(answers.porn_impact_scale ?? 2)}
        onChange={(event) => {
          const nextValue = Number(event.currentTarget.value);
          setAnswers((prev) => ({
            ...prev,
            porn_impact_scale: nextValue,
          }));
        }}
        style={{ width: '100%', marginBottom: 12 }}
      />
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          opacity: 0.75,
        }}
      >
        <span>Nuisible</span>
        <span>Bénéfique</span>
      </div>
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
            porn_impact_scale:
              prev.porn_impact_scale !== undefined ? prev.porn_impact_scale : 2,
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
