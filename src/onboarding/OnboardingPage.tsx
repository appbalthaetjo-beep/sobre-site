import { useCallback, useState } from 'react';
import { onboardingSteps, type OnboardingStep, type StepId } from './flow';
import { customComponents, CustomGenericStep, type CustomStep } from './custom';
import type { QuizAnswers } from './quizResult';

const RECENT_EFFECTS_DETAILS = [
  '🧠 Brouillard mental persistant (difficile de se concentrer)',
  '💔 Problèmes de confiance ou d’estime de soi',
  '😰 Anxiété sociale en hausse',
  '🚀 Manque de motivation pour commencer ou terminer des tâches',
  '🎯 Difficultés de concentration',
  '💞 Perte d’intérêt pour l’intimité',
  '🍆 Difficultés d’érection',
] as const;

function findStep(id: StepId): OnboardingStep {
  const step = onboardingSteps.find((s) => s.id === id);
  if (!step) {
    throw new Error(`Step not found: ${id}`);
  }
  return step;
}

export function OnboardingPage() {
  const [currentStepId, setCurrentStepId] = useState<StepId>('index');
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const step = findStep(currentStepId);
  const customStep = step.kind === 'custom' ? (step as CustomStep) : null;
  const CustomComponent = customStep
    ? customComponents[customStep.customKey] ?? CustomGenericStep
    : null;

  const goNext = useCallback(() => {
    if (step.nav?.next) {
      setCurrentStepId(step.nav.next);
    }
  }, [step.nav?.next]);

  const goBack = useCallback(() => {
    if (step.nav?.back) {
      setCurrentStepId(step.nav.back);
    }
  }, [step.nav?.back]);

  return (
    <main
      data-answers-count={Object.keys(answers).length}
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '16px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div>
        <div style={{ marginBottom: 16, fontSize: 14, opacity: 0.7 }}>
          Etape {onboardingSteps.findIndex((s) => s.id === step.id) + 1} / {onboardingSteps.length}
        </div>

        {step.kind === 'single_choice' && (
          <div>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>{step.content.title}</h1>
            {step.content.helperText && <p style={{ marginBottom: 16 }}>{step.content.helperText}</p>}
            {step.data.questionKey === 'recent_effects' && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '12px',
                  borderRadius: 12,
                  border: '1px solid #e7e7e7',
                  background: '#fafafa',
                }}
              >
                {RECENT_EFFECTS_DETAILS.map((detail) => (
                  <p key={detail} style={{ margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    {detail}
                  </p>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {step.data.choices.map((choice) => (
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
                      [step.data.questionKey]: choice.id,
                    }));
                    goNext();
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {customStep && CustomComponent && (
          <CustomComponent
            step={customStep}
            goNext={goNext}
            goBack={goBack}
            answers={answers}
            setAnswers={setAnswers}
          />
        )}
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <button
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            border: '1px solid #ddd',
            background: '#f7f7f7',
            cursor: step.nav?.back ? 'pointer' : 'not-allowed',
            opacity: step.nav?.back ? 1 : 0.5,
          }}
          onClick={goBack}
          disabled={!step.nav?.back}
        >
          {'<-'} Retour
        </button>
      </div>
    </main>
  );
}
