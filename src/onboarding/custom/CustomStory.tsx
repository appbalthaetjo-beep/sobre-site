import { useEffect, useMemo, useState } from 'react';
import type { CustomProps } from './types';

const STORY_LINES = [
  'La plupart des personnes qui essaient d’arrêter le porno 🌽 n’échouent pas parce qu’elles sont faibles.',
  'Elles échouent parce qu’elles ne comprennent pas vraiment leurs habitudes ni ce qui déclenche leurs envies.',
  'Nous allons t’aider à comprendre ça.',
  'Commençons par voir si tu as vraiment un problème avec le porno.',
];

export function CustomStory({ step, goNext }: CustomProps) {
  const fullText = useMemo(() => STORY_LINES.join('\n\n'), []);
  const [visibleChars, setVisibleChars] = useState(0);
  const isComplete = visibleChars >= fullText.length;

  useEffect(() => {
    if (isComplete) return;
    const timeoutId = window.setTimeout(() => {
      setVisibleChars((prev) => prev + 1);
    }, 16);
    return () => window.clearTimeout(timeoutId);
  }, [isComplete, visibleChars]);

  return (
    <div>
      <p
        style={{
          minHeight: 220,
          marginBottom: 16,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}
      >
        {fullText.slice(0, visibleChars)}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {!isComplete && (
          <button
            style={{
              padding: '12px 16px',
              borderRadius: 999,
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer',
            }}
            onClick={() => setVisibleChars(fullText.length)}
          >
            Afficher tout
          </button>
        )}
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
    </div>
  );
}
