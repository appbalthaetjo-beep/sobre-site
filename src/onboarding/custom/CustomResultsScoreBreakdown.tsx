import { computeQuizResult } from '../quizResult';
import type { CustomProps } from './types';

export function CustomResultsScoreBreakdown({ step, answers, goNext }: CustomProps) {
  const quizResult = computeQuizResult(answers);
  const scoreDelta = quizResult.adjustedScore - quizResult.averageScore;
  const absDelta = Math.abs(scoreDelta);
  const deltaText =
    scoreDelta >= 0
      ? `${absDelta}% de dépendance en plus que la moyenne ↘`
      : `${absDelta}% de dépendance en moins que la moyenne ↘`;

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Analyse complète</h1>
      <p style={{ marginBottom: 8, color: '#444' }}>On a quelque chose à te dire…</p>
      <p style={{ marginBottom: 18, lineHeight: 1.5 }}>
        Tes réponses indiquent une dépendance claire à la pornographie en ligne*
      </p>
      <div style={{ marginBottom: 8, fontSize: 14, opacity: 0.75 }}>Ton score</div>
      <p style={{ marginBottom: 14, fontWeight: 700, fontSize: 26 }}>
        {quizResult.adjustedScore}%
      </p>
      <div
        style={{
          marginBottom: 8,
          height: 12,
          borderRadius: 999,
          background: '#e8e8e8',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${quizResult.adjustedScore}%`,
            height: '100%',
            background: '#111',
          }}
        />
      </div>
      <div style={{ marginBottom: 4, fontSize: 14, opacity: 0.75 }}>
        Moyenne: {quizResult.averageScore}%
      </div>
      <p style={{ marginBottom: 16, lineHeight: 1.45 }}>
        <strong>{deltaText}</strong>
      </p>
      <p style={{ marginBottom: 24, fontSize: 12, color: '#666' }}>
        * Ce résultat est indicatif et ne constitue pas un diagnostic médical.
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
