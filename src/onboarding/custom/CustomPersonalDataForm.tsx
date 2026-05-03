import { useState, type CSSProperties } from 'react';
import type { CustomProps } from './types';

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #ddd',
  marginBottom: 10,
  fontSize: 15,
};

export function CustomPersonalDataForm({
  step,
  goNext,
  answers,
  setAnswers,
}: CustomProps) {
  const [firstName, setFirstName] = useState(
    String(answers.firstName ?? answers.first_name ?? '')
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Ton nom est important.</h1>
      <p style={{ marginBottom: 16, color: '#444' }}>
        Comment dois-je t’appeler ?
      </p>
      <input
        style={fieldStyle}
        type="text"
        placeholder="Ton prénom"
        value={firstName}
        onChange={(event) => setFirstName(event.currentTarget.value)}
      />
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
            firstName: firstName.trim(),
            first_name: firstName.trim(),
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
