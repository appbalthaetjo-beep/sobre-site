export type QuizAnswers = Record<string, string | number>;

export const scoreWeights = {
  gender: { masculin: 0, feminin: 0, 'non-binaire': 0 },
  frequency: {
    'plus-fois-jour': 25,
    'fois-jour': 20,
    'fois-semaine': 15,
    'moins-semaine': 5,
  },
  control: { frequemment: 25, occasionnellement: 15, rarement: 5 },
  escalation: { oui: 20, non: 0 },
  firstExposure: { '12-moins': 15, '13-16': 10, '17-24': 5, '25-plus': 0 },
  arousal: { frequemment: 20, occasionnellement: 12, rarement: 3 },
  stress: { frequemment: 15, occasionnellement: 8, rarement: 2 },
  boredom: { frequemment: 10, occasionnellement: 6, rarement: 1 },
  money: { oui: 10, non: 0 },
  post_masturbation_feeling: {
    disappointed: 12,
    guilty: 15,
    relieved: 6,
    euphoric: 3,
    prefer_not_to_say: 0,
  },
  porn_impact_scale: { 0: 18, 1: 12, 2: 7, 3: 3, 4: 0 },
  recent_effects: { yes: 12, no: 0 },
} as const;

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

export const maxPossibleScore = Object.values(scoreWeights)
  .map((mapping) =>
    Math.max(...Object.values(mapping as Record<string, number>))
  )
  .reduce((sum, value) => sum + value, 0);

export function computeQuizResult(answers: QuizAnswers | null | undefined) {
  try {
    if (!answers || Object.keys(answers).length === 0) {
      return {
        rawScore: 0,
        maxPossible: maxPossibleScore,
        percentage: 0,
        adjustedScore: 50,
        averageScore: 35,
      };
    }

    let totalScore = 0;

    for (const [category, answer] of Object.entries(answers)) {
      const mapping = (scoreWeights as Record<string, Record<string, number>>)[
        category
      ];
      if (!mapping) continue;

      const key = String(answer);
      if (mapping[key] !== undefined) {
        totalScore += mapping[key];
      }
    }

    const percentageScore =
      maxPossibleScore > 0
        ? Math.round((totalScore / maxPossibleScore) * 100)
        : 0;
    const adjustedScore = clampPercent(Math.max(15, percentageScore));

    return {
      rawScore: totalScore,
      maxPossible: maxPossibleScore,
      percentage: percentageScore,
      adjustedScore,
      averageScore: 35,
    };
  } catch {
    return {
      rawScore: 0,
      maxPossible: maxPossibleScore,
      percentage: 0,
      adjustedScore: 40,
      averageScore: 35,
    };
  }
}
