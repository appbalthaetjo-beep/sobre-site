import { useEffect, useMemo, useState } from 'react';
import type { CustomProps } from './types';

const LOADING_MESSAGES = [
  'Apprentissage de tes déclencheurs...',
  'Apprentissage de tes déclencheurs de rechute',
  'Analyse de tes habitudes',
  'Finalisation de ton diagnostic',
] as const;

const TOTAL_DURATION_MS = 3200;

export function CustomLoadingDiagnostic({ goNext }: CustomProps) {
  const [progress, setProgress] = useState(0);
  const messageIndex = useMemo(() => {
    const fraction = progress / 100;
    return Math.min(
      LOADING_MESSAGES.length - 1,
      Math.floor(fraction * LOADING_MESSAGES.length)
    );
  }, [progress]);

  useEffect(() => {
    const start = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const nextProgress = Math.min(100, (elapsed / TOTAL_DURATION_MS) * 100);
      setProgress(nextProgress);
    }, 50);

    const timeoutId = window.setTimeout(goNext, TOTAL_DURATION_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [goNext]);

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Calcul en cours</h1>
      <p style={{ marginBottom: 16, color: '#444', minHeight: 24 }}>
        {LOADING_MESSAGES[messageIndex]}
      </p>
      <div
        style={{
          marginBottom: 8,
          height: 10,
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
    </div>
  );
}
