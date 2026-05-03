import { useEffect, useState } from 'react';
import type { CustomProps } from './types';

const AUTO_ADVANCE_MS = 1600;

export function CustomConsiderThis({ goNext, answers }: CustomProps) {
  const [progress, setProgress] = useState(0);
  const firstName = String(answers.firstName ?? answers.first_name ?? '').trim();
  const considerText = firstName
    ? `D’accord ${firstName}, passons au diagnostic...`
    : 'D’accord, passons au diagnostic...';

  useEffect(() => {
    const start = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const nextProgress = Math.min(100, (elapsed / AUTO_ADVANCE_MS) * 100);
      setProgress(nextProgress);
    }, 50);

    const timeoutId = window.setTimeout(() => {
      goNext();
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [goNext]);

  return (
    <div>
      <p style={{ marginBottom: 20, color: '#444', fontSize: 22, lineHeight: 1.35 }}>
        {considerText}
      </p>
      <div
        style={{
          marginBottom: 14,
          height: 8,
          borderRadius: 999,
          background: '#ececec',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#111',
            transition: 'width 60ms linear',
          }}
        />
      </div>
      <button
        style={{
          padding: '12px 16px',
          borderRadius: 999,
          border: 'none',
          background: 'black',
          color: 'white',
          cursor: 'pointer',
          opacity: 1,
        }}
        onClick={goNext}
      >
        Continuer
      </button>
    </div>
  );
}
