import type { CustomProps } from './types';

const firstExposureChoices = [
  { id: '12-moins', label: '12 ans ou moins' },
  { id: '13-16', label: '13 à 16 ans' },
  { id: '17-24', label: '17 à 24 ans' },
  { id: '25-plus', label: '25 ans ou plus' },
] as const;

export function CustomFirstExposurePicker({
  setAnswers,
  goNext,
}: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>
        À quel âge avez-vous découvert du contenu explicite pour la première fois ?
      </h1>
      <p style={{ marginBottom: 16, color: '#444' }}>Faites défiler pour choisir.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {firstExposureChoices.map((choice) => (
          <button
            key={choice.id}
            style={{
              padding: '12px 16px',
              borderRadius: 999,
              border: '1px solid #ddd',
              background: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
            }}
            onClick={() => {
              setAnswers((prev) => ({
                ...prev,
                firstExposure: choice.id,
              }));
              goNext();
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
