import type { Dispatch, SetStateAction } from 'react';
import type { OnboardingStep } from '../flow';
import type { QuizAnswers } from '../quizResult';

export type CustomStep = Extract<OnboardingStep, { kind: 'custom' }>;

export type CustomProps = {
  step: CustomStep;
  goNext: () => void;
  goBack: () => void;
  answers: QuizAnswers;
  setAnswers: Dispatch<SetStateAction<QuizAnswers>>;
};
