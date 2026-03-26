import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePostHog } from "@posthog/react";
import "./onboarding-first5.css";
import { getApiBaseUrl } from "../lib/apiBaseUrl";
import { getCheckoutIdentityError, readFunnelIdentityFromSearch } from "../lib/funnelIdentity";
import { savePendingPurchase, trackMetaEvent, trackMetaEventOnce } from "../lib/metaPixel";
import { capturePostHogEvent, capturePostHogEventOnce, savePendingCheckout } from "../lib/posthog";
type StepId =
  | "index"
  | "story"
  | "personal-data"
  | "consider-this"
  | "question-1"
  | "question-2"
  | "question-3"
  | "youre-in-the-right-place"
  | "question-4"
  | "question-5"
  | "question-6"
  | "question-8"
  | "question-9"
  | "question-10"
  | "question-11"
  | "question-12"
  | "question-13"
  | "loading"
  | "results"
  | "symptoms"
  | "slide-3"
  | "slide-1"
  | "slide-2"
  | "slide-4"
  | "slide-6"
  | "slide-7"
  | "slide-8"
  | "slide-9"
  | "slide-10"
  | "slide-11"
  | "testimonials"
  | "past-attempts"
  | "rewiring-advantages"
  | "personal-goals"
  | "commitment-signature"
  | "rate-us"
  | "free-trial"
  | "email-capture"
  | "personalized-summary"
  | "trial-reminder";

type Answers = {
  personalData?: { firstName: string };
  quizAnswers: Record<string, string | number>;
  symptoms?: string[];
  userGoals?: string[];
  referralCode?: string;
};

type CheckoutPlan = "month" | "year";

type PreparedCheckout = {
  key: string;
  url: string;
  email: string;
  plan: CheckoutPlan;
  offer: string;
};

const FLOW_VERSION = "email_step_v1";
const withFlowVersion = (properties?: Record<string, string | number | boolean | null | undefined>) => ({
  ...(properties ?? {}),
  flow_version: FLOW_VERSION,
});

export type CustomProps = {
  step: StepId;
  goNext: () => void;
  goBack: () => void;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
};

type Props = {
  onDone?: (answers: Answers) => void;
  onLoginClick?: () => void;
};

const STEP_ORDER: StepId[] = [
  "index",
  "story",
  "personal-data",
  "consider-this",
  "question-1",
  "question-2",
  "question-3",
  "youre-in-the-right-place",
  "question-4",
  "question-5",
  "question-6",
  "question-8",
  "question-9",
  "question-10",
  "question-11",
  "question-12",
  "question-13",
  "loading",
  "results",
  "symptoms",
  "slide-3",
  "slide-1",
  "slide-2",
  "slide-4",
  "slide-6",
  "slide-7",
  "slide-8",
  "slide-9",
  "slide-10",
  "slide-11",
  "testimonials",
  "past-attempts",
  "rewiring-advantages",
  "personal-goals",
  "commitment-signature",
  "rate-us",
  "personalized-summary",
  "email-capture",
  "free-trial",
  "trial-reminder",
];

const INTRO_STEPS = new Set<StepId>([
  "index",
  "story",
  "personal-data",
  "consider-this",
  "youre-in-the-right-place",
]);
const QUIZ_STEPS = new Set<StepId>([
  "question-1",
  "question-2",
  "question-3",
  "question-4",
  "question-5",
  "question-6",
  "question-8",
  "question-9",
  "question-10",
  "question-11",
  "question-12",
  "question-13",
]);
const SLIDE_STEPS = new Set<StepId>([
  "slide-1",
  "slide-2",
  "slide-3",
  "slide-4",
  "slide-6",
  "slide-7",
  "slide-8",
  "slide-9",
  "slide-10",
  "slide-11",
]);
const PROOF_STEPS = new Set<StepId>([
  "testimonials",
  "past-attempts",
  "rewiring-advantages",
  "personal-goals",
  "commitment-signature",
  "rate-us",
]);

function getStepGroup(step: StepId) {
  if (INTRO_STEPS.has(step)) return "intro";
  if (QUIZ_STEPS.has(step)) return "quiz";
  if (SLIDE_STEPS.has(step)) return "slides";
  if (step === "loading" || step === "results" || step === "symptoms") return "results";
  if (PROOF_STEPS.has(step)) return "proof";
  if (step === "personalized-summary") return "summary";
  if (step === "email-capture") return "email";
  if (step === "free-trial") return "offer";
  if (step === "trial-reminder") return "paywall";
  return "other";
}

const Logo = () => (
  <img
    src="https://i.imgur.com/Gq0mmt7.png"
    alt="Sobre"
    className="onb-logo"
    draggable={false}
  />
);

const defaultPageVariants: Variants = {
  enter: (direction: 1 | -1) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 360,
      damping: 34,
      mass: 0.9,
    },
  },
  exit: (direction: 1 | -1) => ({
    x: direction > 0 ? -36 : 36,
    opacity: 0,
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
  }),
};

const cinematicPageVariants: Variants = {
  enter: () => ({
    opacity: 0,
    scale: 0.985,
    y: 14,
    filter: "blur(6px)",
  }),
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: () => ({
    opacity: 0,
    scale: 1.01,
    y: -10,
    filter: "blur(6px)",
    transition: { duration: 0.42, ease: [0.4, 0, 1, 1] as const },
  }),
};

const QUESTION_SELECTION_FEEDBACK_MS = 220;
const CINEMATIC_SLIDE_STEPS: StepId[] = [
  "slide-3",
  "slide-1",
  "slide-2",
  "slide-4",
  "slide-6",
  "slide-7",
  "slide-8",
  "slide-9",
  "slide-10",
  "slide-11",
];

const SCORE_WEIGHTS = {
  gender: { masculin: 0, feminin: 0, "non-binaire": 0 },
  frequency: {
    "plus-fois-jour": 25,
    "fois-jour": 20,
    "fois-semaine": 15,
    "moins-semaine": 5,
  },
  control: { frequemment: 25, occasionnellement: 15, rarement: 5 },
  escalation: { oui: 20, non: 0 },
  firstExposure: { "12-moins": 15, "13-16": 10, "17-24": 5, "25-plus": 0 },
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

const AVERAGE_SCORE = 35;

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

const PROMO_MONTH_SHORT = ["JAN", "FEV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"];

function getPromoUserPart(firstName?: string) {
  const normalized = String(firstName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  return (normalized.slice(0, 3) || "USR").padEnd(3, "X");
}

function buildPromoCode(firstName: string | undefined, offer: "50" | "60") {
  const userPart = getPromoUserPart(firstName);
  if (offer === "60") return `${userPart}_FINAL`;
  const monthPart = PROMO_MONTH_SHORT[new Date().getMonth()] || "JAN";
  const yearPart = String(new Date().getFullYear());
  return `${userPart}_${monthPart}${yearPart}`;
}

function computeQuizResult(answers: Record<string, string | number>) {
  const maxPossibleScore = Object.values(SCORE_WEIGHTS)
    .map((mapping) => Math.max(...Object.values(mapping)))
    .reduce((sum, v) => sum + v, 0);

  if (!answers || Object.keys(answers).length === 0) {
    return { adjustedScore: 50, maxPossibleScore, rawScore: 0, percentageScore: 0 };
  }

  let totalScore = 0;
  for (const [category, answer] of Object.entries(answers)) {
    const mapping = (SCORE_WEIGHTS as Record<string, Record<string, number>>)[category];
    if (!mapping) continue;
    const key = String(answer);
    if (mapping[key] !== undefined) totalScore += mapping[key];
  }

  const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
  const adjustedScore = clampPercent(Math.max(15, percentageScore));

  return { adjustedScore, maxPossibleScore, rawScore: totalScore, percentageScore };
}

function useTypewriterMessages(
  messages: string[],
  letterDelay = 45,
  messageDelay = 1300
) {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [finished, setFinished] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  const letterTimer = useRef<number | null>(null);
  const waitTimer = useRef<number | null>(null);

  const clearAllTimers = () => {
    if (letterTimer.current) window.clearTimeout(letterTimer.current);
    if (waitTimer.current) window.clearTimeout(waitTimer.current);
    letterTimer.current = null;
    waitTimer.current = null;
  };

  const current = messages[index] ?? "";

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  useEffect(() => {
    if (!messages.length) {
      setFinished(true);
      return;
    }
  }, [messages.length]);

  useEffect(() => {
    if (!messages.length || finished || !isTyping) return;

    if (displayedText.length < current.length) {
      letterTimer.current = window.setTimeout(() => {
        setDisplayedText(current.slice(0, displayedText.length + 1));
      }, letterDelay);
      return () => {
        if (letterTimer.current) window.clearTimeout(letterTimer.current);
      };
    }

    setIsTyping(false);
  }, [
    current,
    displayedText,
    finished,
    isTyping,
    letterDelay,
    messages.length,
  ]);

  useEffect(() => {
    if (!messages.length || finished || isTyping) return;

    waitTimer.current = window.setTimeout(() => {
      if (index < messages.length - 1) {
        setIndex((v) => v + 1);
        setDisplayedText("");
        setIsTyping(true);
      } else {
        setFinished(true);
      }
    }, messageDelay);

    return () => {
      if (waitTimer.current) window.clearTimeout(waitTimer.current);
    };
  }, [finished, index, isTyping, messageDelay, messages.length]);

  const tapToContinue = () => {
    if (finished) return;
    if (letterTimer.current) window.clearTimeout(letterTimer.current);
    if (waitTimer.current) window.clearTimeout(waitTimer.current);

    if (isTyping) {
      setDisplayedText(current);
      setIsTyping(false);
      return;
    }

    if (index < messages.length - 1) {
      setIndex((v) => v + 1);
      setDisplayedText("");
      setIsTyping(true);
    } else {
      setFinished(true);
    }
  };

  return { displayedText, finished, tapToContinue };
}

const CustomWelcomeIntro: React.FC<
  CustomProps & { onLoginClick?: () => void }
> = ({ goNext }) => {
  return (
    <div className="onb-screen onb-black">
      <div className="onb-center-stack">
        <div className="onb-header-block">
          <Logo />
          <h1 className="onb-title-xl onb-welcome-title">Crée ton plan personnalisé pour arrêter la pornographie</h1>
        </div>

        <p className="onb-subtitle">
          Réponds à quelques questions et obtiens ton programme adapté à ta situation — comme les +5000 hommes qui ont
          repris le contrôle
        </p>

        <div className="onb-welcome-progress" aria-hidden="true">
          <div className="onb-progress-bg">
            <div className="onb-progress-fill" style={{ width: "10%" }} />
          </div>
        </div>

        <button className="onb-btn-gold" onClick={goNext}>
          Créer mon plan personnalisé
        </button>

        <p className="onb-welcome-meta">Résultats immédiats · 100% confidentiel</p>
      </div>
    </div>
  );
};

const CustomStory: React.FC<CustomProps> = ({ goNext }) => {
  const { displayedText, finished, tapToContinue } = useTypewriterMessages(
    [
      "La plupart des personnes qui essaient d’arrêter le porno 🌽 n’échouent pas parce qu’elles sont faibles.",
      "Elles échouent parce qu’elles ne comprennent pas vraiment leurs habitudes ni ce qui déclenche leurs envies.",
      "Nous allons t’aider à comprendre ça.",
      "Commençons par voir si tu as vraiment un problème avec le porno.",
    ],
    45,
    1300
  );

  return (
    <div className="onb-screen onb-black">
      <div className="onb-top-logo">
        <Logo />
      </div>

      <div className="onb-story-content">
        <p className="onb-story-text">{displayedText}</p>
      </div>

      {!finished && (
        <button className="onb-tap-continue" onClick={tapToContinue}>
          tap to continue -&gt;
        </button>
      )}

      {finished && (
        <div className="onb-bottom-cta">
          <button className="onb-btn-gold" onClick={goNext}>
            Commencer le quiz
          </button>
        </div>
      )}
    </div>
  );
};

const CustomPersonalData: React.FC<CustomProps> = ({
  goNext,
  answers,
  setAnswers,
}) => {
  const [firstName, setFirstName] = useState(answers.personalData?.firstName ?? "");
  const canProceed = firstName.trim().length > 0;

  const handleContinue = () => {
    if (!canProceed) return;
    setAnswers((prev) => ({
      ...prev,
      personalData: { firstName: firstName.trim() },
    }));
    goNext();
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-form-wrap">
        <p className="onb-kicker">Ton nom est important.</p>
        <h2 className="onb-title-lg">Comment dois-je t'appeler ?</h2>

        <input
          className="onb-input"
          placeholder="Ton prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          maxLength={30}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleContinue();
          }}
        />

        <button
          className={`onb-btn-gold ${!canProceed ? "is-disabled" : ""}`}
          disabled={!canProceed}
          onClick={handleContinue}
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

const CustomConsiderThis: React.FC<CustomProps> = ({ goNext, answers }) => {
  const firstName = answers.personalData?.firstName?.trim() || "toi";

  useEffect(() => {
    const id = window.setTimeout(goNext, 2200);
    return () => window.clearTimeout(id);
  }, [goNext]);

  return (
    <div className="onb-screen onb-black">
      <div className="onb-center-stack">
        <p className="onb-consider-text">{`D'accord ${firstName},\npassons au diagnostic...`}</p>
      </div>
    </div>
  );
};

const CustomQuestion1: React.FC<CustomProps> = ({
  goNext,
  goBack,
  answers,
  setAnswers,
}) => {
  const [selected, setSelected] = useState<string>(
    String(answers.quizAnswers.gender ?? "")
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (navTimer.current) window.clearTimeout(navTimer.current);
    };
  }, []);

  const pick = (id: string) => {
    if (isTransitioning) return;

    setSelected(id);
    setAnswers((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, gender: id },
    }));

    if (navTimer.current) window.clearTimeout(navTimer.current);
    setIsTransitioning(true);
    navTimer.current = window.setTimeout(() => goNext(), QUESTION_SELECTION_FEEDBACK_MS);
  };

  const progressPercent = (1 / 7) * 100;

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button
          className="onb-back-btn"
          onClick={goBack}
          aria-label="Retour"
          disabled={isTransitioning}
        >
          {"\u2190"}
        </button>
        <div className="onb-progress-bg">
          <div
            className="onb-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-question-motion">
        <div className="onb-question-content">
          <p className="onb-helper">Cela nous aide à adapter ton accompagnement.</p>
          <h2 className="onb-title-lg">Quel est votre genre ?</h2>

          <div className="onb-choice-list">
            {[
              { id: "masculin", label: "Masculin" },
              { id: "feminin", label: "Féminin" },
            ].map((c) => (
              <button
                key={c.id}
                className={`onb-choice ${selected === c.id ? "is-selected" : ""}`}
                onClick={() => pick(c.id)}
                disabled={isTransitioning}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="onb-question-bottom">
        <button className="onb-skip" onClick={goNext} disabled={isTransitioning}>
          Passer le test
        </button>
      </div>
    </div>
  );
};

type QuestionChoice = { id: string; label: string };

type QuestionSingleChoiceProps = CustomProps & {
  progressCurrent: number;
  progressTotal: number;
  title: string;
  helperText?: string;
  questionKey: string;
  choices: QuestionChoice[];
  showSkip?: boolean;
};

const QuestionSingleChoiceScreen: React.FC<QuestionSingleChoiceProps> = ({
  goNext,
  goBack,
  answers,
  setAnswers,
  progressCurrent,
  progressTotal,
  title,
  helperText,
  questionKey,
  choices,
  showSkip = true,
}) => {
  const [selected, setSelected] = useState<string>(
    String(answers.quizAnswers[questionKey] ?? "")
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (nextTimer.current) window.clearTimeout(nextTimer.current);
    };
  }, []);

  const pick = (id: string) => {
    if (isTransitioning) return;

    setSelected(id);
    setAnswers((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [questionKey]: id },
    }));

    if (nextTimer.current) window.clearTimeout(nextTimer.current);
    setIsTransitioning(true);
    nextTimer.current = window.setTimeout(() => goNext(), QUESTION_SELECTION_FEEDBACK_MS);
  };

  const progressPercent = (progressCurrent / progressTotal) * 100;

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button
          className="onb-back-btn"
          onClick={goBack}
          aria-label="Retour"
          disabled={isTransitioning}
        >
          {"\u2190"}
        </button>
        <div className="onb-progress-bg">
          <div className="onb-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-question-motion">
        <div className="onb-question-content">
          {helperText ? <p className="onb-helper">{helperText}</p> : null}
          <h2 className="onb-title-lg">{title}</h2>

          <div className="onb-choice-list">
            {choices.map((c) => (
              <button
                key={c.id}
                className={`onb-choice ${selected === c.id ? "is-selected" : ""}`}
                onClick={() => pick(c.id)}
                disabled={isTransitioning}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="onb-question-bottom">
        {showSkip ? (
          <button className="onb-skip" onClick={goNext} disabled={isTransitioning}>
            Passer le test
          </button>
        ) : null}
      </div>
    </div>
  );
};

const CustomQuestion2: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={2}
    progressTotal={7}
    title="À quelle fréquence regardez-vous habituellement de la pornographie ?"
    questionKey="frequency"
    choices={[
      { id: "plus-fois-jour", label: "Plus d'une fois par jour" },
      { id: "fois-jour", label: "Une fois par jour" },
      { id: "fois-semaine", label: "Quelques fois par semaine" },
      { id: "moins-semaine", label: "Moins d'une fois par semaine" },
    ]}
  />
);

const CustomQuestion3: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={3}
    progressTotal={7}
    title="Ressentez-vous parfois un manque de contrôle sur votre consommation de pornographie ?"
    questionKey="control"
    choices={[
      { id: "frequemment", label: "Fréquemment" },
      { id: "occasionnellement", label: "Occasionnellement" },
      { id: "rarement", label: "Rarement ou jamais" },
    ]}
  />
);

const CustomYoureInTheRightPlace: React.FC<CustomProps> = ({ goNext, goBack }) => {
  return (
    <div className="onb-screen onb-gradient-gold">
      <div className="onb-yi-header">
        <button className="onb-back-btn onb-back-btn-dark" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-yi-scroll">
        <div className="onb-yi-cards">
          <div className="onb-yi-card onb-yi-tilt-1">
            <h3>🧠 Comprendre vos déclencheurs</h3>
            <p>On va identifier ce qui vous pousse vers la pornographie, pour casser le cycle à la racine.</p>
          </div>

          <div className="onb-yi-card onb-yi-tilt-2">
            <h3>⚡ Retrouver le contrôle</h3>
            <p>Des outils simples et concrets pour réduire les envies et reprendre la main, jour après jour.</p>
          </div>

          <div className="onb-yi-card onb-yi-card-faded onb-yi-tilt-3">
            <span className="onb-yi-kicker">Votre objectif</span>
            <h4>Vivre sans porno, avec intégrité</h4>
            <p>Beaucoup commencent exactement ici.</p>
          </div>
        </div>

        <div className="onb-yi-bottom">
          <h2>Vous êtes au bon endroit</h2>
          <p>
            Des milliers de personnes ont commencé avec les mêmes difficultés. Le diagnostic qui suit va clarifier
            votre situation et vous montrer la prochaine étape.
          </p>
          <button className="onb-btn-light-gold" onClick={goNext}>
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomQuestion4: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={4}
    progressTotal={7}
    title="Avez-vous remarqué une évolution vers du contenu plus extrême ou graphique ?"
    questionKey="escalation"
    choices={[
      { id: "oui", label: "Oui" },
      { id: "non", label: "Non" },
    ]}
  />
);

const ITEM_HEIGHT = 54;
const VISIBLE_ITEMS = 5;

const CustomQuestion5: React.FC<CustomProps> = ({ goNext, goBack, answers, setAnswers }) => {
  const choices = useMemo(
    () => [
      { id: "12-moins", label: "12 ans ou moins" },
      { id: "13-16", label: "13–16 ans" },
      { id: "17-24", label: "17–24 ans" },
      { id: "25-plus", label: "25 ans ou plus" },
    ],
    []
  );

  const existing = String(answers.quizAnswers.firstExposure ?? "");
  const rawIndex = choices.findIndex((c) => c.id === existing);
  const initialIndex = rawIndex === -1 ? 1 : rawIndex;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    if (!listRef.current) return;
    const idx = Math.round(listRef.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(choices.length - 1, idx));
    if (clamped !== selectedIndex) setSelectedIndex(clamped);
  };

  const selected = choices[selectedIndex];

  const handleContinue = () => {
    if (!selected) return;
    setAnswers((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, firstExposure: selected.id },
    }));
    goNext();
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-progress-bg">
          <div className="onb-progress-fill" style={{ width: `${(5 / 7) * 100}%` }} />
        </div>
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-q5-content">
        <h2 className="onb-title-lg">À quel âge avez-vous découvert du contenu explicite pour la première fois ?</h2>

        <div className="onb-q5-picker">
          <div className="onb-q5-highlight" />
          <div
            ref={listRef}
            className="onb-q5-list"
            onScroll={onScroll}
          >
            <div style={{ height: ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT }} />
            {choices.map((c, i) => (
              <div
                key={c.id}
                className={`onb-q5-item ${i === selectedIndex ? "is-selected" : "is-dimmed"}`}
                style={{ height: ITEM_HEIGHT }}
              >
                {c.label}
              </div>
            ))}
            <div style={{ height: ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT }} />
          </div>
        </div>

        <p className="onb-q5-hint">Faites défiler pour choisir.</p>
      </div>

      <div className="onb-q5-bottom">
        <button className="onb-btn-white" onClick={handleContinue}>
          Continuer
        </button>
      </div>
    </div>
  );
};

const CustomQuestion6: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={6}
    progressTotal={7}
    title="Trouvez-vous difficile d'atteindre l'excitation sexuelle sans pornographie ou fantasmes ?"
    questionKey="arousal"
    choices={[
      { id: "frequemment", label: "Fréquemment" },
      { id: "occasionnellement", label: "Occasionnellement" },
      { id: "rarement", label: "Rarement ou jamais" },
    ]}
  />
);

const CustomQuestion8: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={8}
    progressTotal={13}
    title="Vous tournez-vous vers la pornographie quand vous êtes stressé ?"
    questionKey="stress"
    choices={[
      { id: "frequemment", label: "Fréquemment" },
      { id: "occasionnellement", label: "Occasionnellement" },
      { id: "rarement", label: "Rarement ou jamais" },
    ]}
  />
);

const CustomQuestion9: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={9}
    progressTotal={13}
    title="Regardez-vous de la pornographie par ennui ?"
    questionKey="boredom"
    choices={[
      { id: "frequemment", label: "Fréquemment" },
      { id: "occasionnellement", label: "Occasionnellement" },
      { id: "rarement", label: "Rarement ou jamais" },
    ]}
  />
);

const CustomQuestion10: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={10}
    progressTotal={13}
    title="Avez-vous déjà dépensé de l'argent pour accéder à du contenu explicite ?"
    questionKey="money"
    choices={[
      { id: "oui", label: "Oui" },
      { id: "non", label: "Non" },
    ]}
  />
);

const CustomQuestion11: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={11}
    progressTotal={13}
    title="Comment vous sentez-vous après la masturbation ?"
    questionKey="post_masturbation_feeling"
    choices={[
      { id: "disappointed", label: "Déçu" },
      { id: "guilty", label: "Coupable" },
      { id: "euphoric", label: "Euphorique" },
      { id: "relieved", label: "Soulagé" },
      { id: "prefer_not_to_say", label: "Je préfère ne pas répondre" },
    ]}
  />
);

const CustomQuestion12: React.FC<CustomProps> = ({ goNext, goBack, answers, setAnswers }) => {
  const initial = Number(answers.quizAnswers.porn_impact_scale ?? 2);
  const [value, setValue] = useState<number>(Number.isNaN(initial) ? 2 : initial);

  const emojiMap: Record<number, string> = {
    0: "😣",
    1: "😕",
    2: "😐",
    3: "🙂",
    4: "😄",
  };

  const handleContinue = () => {
    setAnswers((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, porn_impact_scale: value },
    }));
    goNext();
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-progress-bg">
          <div className="onb-progress-fill" style={{ width: `${(12 / 13) * 100}%` }} />
        </div>
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-q12-content">
        <h2 className="onb-title-lg">Quel impact la pornographie a-t-elle sur ta vie ?</h2>

        <div className="onb-q12-emoji">{emojiMap[value]}</div>

        <div className="onb-q12-slider-wrap">
          <input
            className="onb-q12-slider"
            type="range"
            min={0}
            max={4}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className="onb-q12-labels">
            <span>Nuisible</span>
            <span>Bénéfique</span>
          </div>
        </div>
      </div>

      <div className="onb-q12-bottom">
        <button className="onb-q12-next" onClick={handleContinue}>
          Suivant ?
        </button>
      </div>
    </div>
  );
};

const CustomQuestion13: React.FC<CustomProps> = ({ goNext, goBack, answers, setAnswers }) => {
  const [selected, setSelected] = useState<string>(String(answers.quizAnswers.recent_effects ?? ""));
  const [isLeaving, setIsLeaving] = useState(false);

  const leaveTimer = useRef<number | null>(null);
  const nextTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      if (nextTimer.current) window.clearTimeout(nextTimer.current);
    };
  }, []);

  const pick = (id: string) => {
    setSelected(id);
    setAnswers((prev) => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, recent_effects: id },
    }));

    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    if (nextTimer.current) window.clearTimeout(nextTimer.current);

    leaveTimer.current = window.setTimeout(() => setIsLeaving(true), 800);
    nextTimer.current = window.setTimeout(() => goNext(), 1200);
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-progress-bg">
          <div className="onb-progress-fill" style={{ width: `100%` }} />
        </div>
        <div className="onb-header-spacer" />
      </div>

      <motion.div
        className="onb-question-motion"
        animate={isLeaving ? { x: -56, opacity: 0.5 } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="onb-question-content">
          <h2 className="onb-title-lg">Avez-vous remarqué l’un de ces effets récemment ?</h2>

          <div className="onb-q13-details">
            <p>🧠 Brouillard mental persistant (difficile de se concentrer)</p>
            <p>💔 Problèmes de confiance ou d’estime de soi</p>
            <p>😰 Anxiété sociale en hausse</p>
            <p>🚀 Manque de motivation pour commencer ou terminer des tâches</p>
            <p>🎯 Difficultés de concentration</p>
            <p>💞 Perte d’intérêt pour l’intimité</p>
            <p>⚠️ Difficultés d’érection</p>
          </div>

          <div className="onb-choice-list">
            {[
              { id: "yes", label: "Oui" },
              { id: "no", label: "Non" },
            ].map((c) => (
              <button
                key={c.id}
                className={`onb-choice ${selected === c.id ? "is-selected" : ""}`}
                onClick={() => pick(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="onb-question-bottom">
        <button className="onb-skip" onClick={goNext}>
          Passer le test
        </button>
      </div>
    </div>
  );
};

const CustomLoading: React.FC<CustomProps> = ({ goNext, goBack }) => {
  const [pct, setPct] = useState(0);
  const [loadingText, setLoadingText] = useState("Apprentissage de tes déclencheurs...");

  useEffect(() => {
    const texts = [
      "Apprentissage de tes déclencheurs de rechute",
      "Analyse de tes habitudes",
      "Finalisation de ton diagnostic",
    ];

    let i = 0;
    const progressInt = window.setInterval(() => {
      setPct((v) => Math.min(v + 1, 100));
    }, 80);

    const txtInt = window.setInterval(() => {
      i = Math.min(i + 1, texts.length - 1);
      setLoadingText(texts[i]);
    }, 2000);

    const done = window.setTimeout(() => {
      goNext();
    }, 8000);

    return () => {
      window.clearInterval(progressInt);
      window.clearInterval(txtInt);
      window.clearTimeout(done);
    };
  }, [goNext]);

  return (
    <div className="onb-screen onb-loading-bg">
      <div className="onb-loading-header">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
      </div>

      <div className="onb-loading-content">
        <div
          className="onb-loading-ring"
          style={{
            background: `conic-gradient(#ffefa3 0deg, #ffd44d ${pct * 1.8}deg, #ffbf00 ${
              pct * 3.6
            }deg, rgba(255,255,255,0.08) ${pct * 3.6}deg 360deg)`,
          }}
        >
          <div className="onb-loading-ring-inner">{pct}%</div>
        </div>

        <h2 className="onb-loading-title">Calcul en cours</h2>
        <p className="onb-loading-subtitle">{loadingText}</p>
      </div>
    </div>
  );
};

const CustomResults: React.FC<CustomProps> = ({ goNext, goBack, answers }) => {
  const [animateBars, setAnimateBars] = useState(false);

  const result = useMemo(() => {
    try {
      return computeQuizResult(answers.quizAnswers ?? {});
    } catch {
      return {
        adjustedScore: 40,
        maxPossibleScore: 0,
        rawScore: 0,
        percentageScore: 0,
      };
    }
  }, [answers.quizAnswers]);

  useEffect(() => {
    const t = window.setTimeout(() => setAnimateBars(true), 280);
    return () => window.clearTimeout(t);
  }, []);

  const userScore = clampPercent(result.adjustedScore);
  const delta = userScore - AVERAGE_SCORE;
  const deltaLabel = delta >= 0 ? `${Math.round(delta)}%` : `${Math.abs(Math.round(delta))}%`;
  const deltaText =
    delta >= 0
      ? `${deltaLabel} de dépendance en plus que la moyenne ?`
      : `${deltaLabel} de dépendance en moins que la moyenne ?`;

  return (
    <div className="onb-screen onb-black">
      <div className="onb-results-top">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
      </div>

      <div className="onb-results-content">
        <h2 className="onb-results-title">Analyse complète</h2>
        <p className="onb-results-lead">On a quelque chose à te dire…</p>
        <p className="onb-results-message">
          Tes réponses indiquent une dépendance claire à la pornographie en ligne*
        </p>

        <div className="onb-results-chart">
          <div className="onb-results-col">
            <div className="onb-results-bar-base">
              <div
                className="onb-results-bar onb-results-bar-user"
                style={{ height: animateBars ? `${Math.max(userScore, 16)}%` : "0%" }}
              >
                <span>{userScore}%</span>
              </div>
            </div>
            <small>Ton score</small>
          </div>

          <div className="onb-results-col">
            <div className="onb-results-bar-base">
              <div
                className="onb-results-bar onb-results-bar-avg"
                style={{ height: animateBars ? `${Math.max(AVERAGE_SCORE, 16)}%` : "0%" }}
              >
                <span>{AVERAGE_SCORE}%</span>
              </div>
            </div>
            <small>Moyenne</small>
          </div>
        </div>

        <p className={`onb-results-delta ${delta >= 0 ? "is-red" : "is-green"}`}>{deltaText}</p>
        <p className="onb-results-disclaimer">
          * Ce résultat est indicatif et ne constitue pas un diagnostic médical.
        </p>

        <button className="onb-results-cta" onClick={goNext}>
          Vérifier tes symptômes
        </button>
      </div>
    </div>
  );
};

const CustomSymptoms: React.FC<CustomProps> = ({ goNext, goBack, answers, setAnswers }) => {
  const [selected, setSelected] = useState<string[]>(answers.symptoms ?? []);

  const categories = [
    {
      title: "Mental",
      symptoms: [
        { id: "demotivated", label: "😞 Se sentir démotivé" },
        { id: "lack_ambition", label: "🎯 Manque d’ambition pour poursuivre des objectifs" },
        { id: "concentration", label: "🧠 Difficulté à se concentrer" },
        { id: "memory", label: "🌫️ Mauvaise mémoire / “brouillard mental”" },
        { id: "anxiety", label: "😰 Anxiété générale" },
      ],
    },
    {
      title: "Physique",
      symptoms: [
        { id: "fatigue", label: "💤 Fatigue et léthargie" },
        { id: "low_libido", label: "💔 Faible désir sexuel" },
        { id: "weak_erections", label: "⚠️ Érections faibles sans pornographie" },
      ],
    },
    {
      title: "Social",
      symptoms: [
        { id: "low_confidence", label: "💔 Faible confiance en soi" },
        { id: "unattractive", label: "🪞 Se sentir peu attirant ou indigne d’amour" },
        { id: "unsatisfying_sex", label: "🫥 Rapports sexuels insatisfaisants ou sans plaisir" },
        { id: "reduced_socializing", label: "🧍 Désir réduit de socialiser" },
        { id: "isolated", label: "🌫️ Se sentir isolé des autres" },
      ],
    },
    {
      title: "Foi",
      symptoms: [{ id: "distant_from_god", label: "🙏 Se sentir éloigné de Dieu" }],
    },
  ];

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleContinue = () => {
    setAnswers((prev) => ({ ...prev, symptoms: selected }));
    goNext();
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-sym-content">
        <h2 className="onb-title-lg">As-tu remarqué certains de ces symptômes récemment ?</h2>
        <p className="onb-helper">Sélectionne tout ce qui te parle.</p>

        <div className="onb-sym-scroll">
          {categories.map((cat) => (
            <section key={cat.title} className="onb-sym-cat">
              <h3>{cat.title}</h3>
              {cat.symptoms.map((s) => {
                const active = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    className={`onb-choice ${active ? "is-selected" : ""}`}
                    onClick={() => toggle(s.id)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      </div>

      <div className="onb-sym-bottom">
        <button className="onb-btn-gold" onClick={handleContinue}>
          Continuer
        </button>
      </div>
    </div>
  );
};

const SlideLogo = () => (
  <img
    src="https://i.imgur.com/35ceOTL.png"
    alt="Sobre"
    className="onb-slide-logo"
    draggable={false}
  />
);

const CustomSlide3: React.FC<CustomProps> = ({ goNext }) => {
  const script = [
    { side: "left", text: "POURQUOI PORNHUB EST DANS TON HISTORIQUE ?!?" },
    { side: "left", text: "TU ME TROMPES ?!?!" },
    { side: "left", text: "JE NE SUIS PAS ASSEZ BIEN POUR TOI ?" },
    { side: "right", text: "BÉBÉ, CE N’EST PAS CE QUE TU CROIS…" },
    { side: "right", text: "C’EST FINI. VA TE METTRE EN COUPLE AVEC UNE PORNSTAR." },
  ] as const;

  return (
    <div className="onb-screen onb-slide-screen onb-gradient-red">
      <div className="onb-slide-header">
        <SlideLogo />
      </div>

      <div className="onb-slide3-top">
        <div className="onb-chat-wrap">
          {script.map((m, i) => (
            <motion.div
              key={`${m.text}-${i}`}
              className={`onb-chat-row ${m.side === "right" ? "is-right" : "is-left"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: i * 0.07 }}
            >
              <div className={`onb-chat-bubble ${m.side === "right" ? "is-right" : "is-left"}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="onb-slide-copy">
        <h2 className="onb-slide-title">Le porno détruit les relations.</h2>
        <p className="onb-slide-message">
          Regarder du porno peut entraîner des difficultés d’érection, une baisse de libido et une perte
          d’attirance envers les autres.
        </p>
      </div>

      <button className="onb-slide-btn-white onb-slide-btn-redtext" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide1: React.FC<CustomProps> = ({ goNext }) => {
  return (
    <div className="onb-screen onb-slide-screen onb-gradient-red">
      <div className="onb-slide-header">
        <SlideLogo />
      </div>

      <div className="onb-slide-main">
        <img
          src="https://i.imgur.com/xXnqTfI.png"
          alt=""
          className="onb-slide-hero-lg"
          draggable={false}
        />

        <h2 className="onb-slide-title">La pornographie est une drogue</h2>
        <p className="onb-slide-message">
          L&apos;utilisation de pornographie libère un produit chimique dans le cerveau appelé dopamine.
          Ce produit chimique vous fait vous sentir bien – c&apos;est pourquoi vous ressentez du plaisir
          lorsque vous regardez de la pornographie.
        </p>
      </div>

      <button className="onb-slide-btn-white onb-slide-btn-redtext" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide2: React.FC<CustomProps> = ({ goNext }) => {
  return (
    <div className="onb-screen onb-slide-screen onb-gradient-red">
      <div className="onb-slide-header">
        <SlideLogo />
      </div>

      <div className="onb-slide-main">
        <img
          src="https://i.imgur.com/aU4nBwM.png"
          alt=""
          className="onb-slide-hero-md"
          draggable={false}
        />

        <h2 className="onb-slide-title">La pornographie brise le désir</h2>
        <p className="onb-slide-message">
          Plus de 50 % des personnes dépendantes au porno ont signalé une perte d’intérêt pour le vrai sexe.
        </p>
      </div>

      <button className="onb-slide-btn-white onb-slide-btn-redtext" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide4: React.FC<CustomProps> = ({ goNext }) => {
  return (
    <div className="onb-screen onb-slide-screen onb-gradient-blue">
      <div className="onb-slide-main">
        <img
          src="https://i.imgur.com/bYpnEIV.png"
          alt=""
          className="onb-slide-hero-md"
          draggable={false}
        />

        <h2 className="onb-slide-title">Chemin vers le rétablissement</h2>
        <p className="onb-slide-message">
          Le rétablissement est possible. En t&apos;abstenant de pornographie, ton cerveau peut réinitialiser
          sa sensibilité à la dopamine, conduisant à des relations plus saines et un bien-être amélioré.
        </p>
      </div>

      <button className="onb-slide-btn-white onb-slide-btn-bluetext" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide6: React.FC<CustomProps> = ({ goNext }) => {
  return (
    <div className="onb-screen onb-slide6-screen">
      <div className="onb-slide6-main">
        <div className="onb-slide6-logo-wrap">
          <SlideLogo />
        </div>

        <div className="onb-slide6-hero-wrap">
          <img
            src="https://i.imgur.com/HZ8ms40.png"
            alt=""
            className="onb-slide6-hero"
            draggable={false}
          />
        </div>

        <div className="onb-slide6-copy">
          <h2 className="onb-slide6-title">Bienvenue sur SOBRE</h2>
          <p className="onb-slide6-message">
            Libérez-vous de la pornographie et reprenez le contrôle de votre vie.
          </p>
        </div>

        <div className="onb-slide6-dots">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={i === 0 ? "onb-dot-active" : "onb-dot"} />
          ))}
        </div>
      </div>

      <button className="onb-btn-gold onb-slide6-next" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide7: React.FC<CustomProps> = ({ goNext }) => {
  return (
    <div className="onb-screen onb-black onb-slide7-screen">
      <div className="onb-slide-header">
        <SlideLogo />
      </div>

      <div className="onb-slide7-live-row">
        <div className="onb-slide7-live">
          <span className="onb-live-dot" />
          LIVE
        </div>
      </div>

      <div className="onb-slide7-post-card">
        <div className="onb-slide7-post-top">
          <h3>Presque au bout !</h3>
          <div className="onb-slide7-badge">75</div>
        </div>
        <p className="onb-slide7-post-text">Aujourd&apos;hui ça fait 75 jours sans porno... je sens déjà la différence.</p>
        <div className="onb-slide7-post-meta">👤 Jacob • 0 jours • il y a 1 jour</div>
      </div>

      <div className="onb-slide7-stats-row">
        <div className="onb-slide7-stat-pill">❤️ 305</div>
        <div className="onb-slide7-stat-pill">💬 1224</div>
        <div className="onb-slide7-stat-pill">🔥 5</div>
      </div>

      <div className="onb-slide7-jake-card">
        <img src="https://i.imgur.com/32zD9SI.png" alt="Jake" className="onb-slide7-jake-avatar" />
        <div className="onb-slide7-jake-copy">
          <div className="onb-slide7-jake-name">Jake</div>
          <div className="onb-slide7-jake-typing">
            En train d&apos;écrire
            <span className="onb-slide7-jake-dots" />
          </div>
        </div>
      </div>

      <div className="onb-slide-copy">
        <h2 className="onb-slide-title">Réussissons ensemble</h2>
        <p className="onb-slide-message">
          Vous n’êtes pas seul. Rejoignez une communauté grandissante de plus de 10 000 membres sur le même chemin,
          qui se soutiennent et se motivent à chaque étape.
        </p>
      </div>

      <div className="onb-slide6-dots">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i === 1 ? "onb-dot-active" : "onb-dot"} />
        ))}
      </div>

      <button className="onb-btn-gold onb-slide6-next" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide8: React.FC<CustomProps> = ({ goNext }) => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setBlocked((v) => !v), 2200);
    return () => window.clearInterval(id);
  }, []);

  const lockIcon = (
    <svg className="onb-slide8-lock-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7 11V8a5 5 0 1 1 10 0v3M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="onb-screen onb-black onb-slide8-screen">
      <div className="onb-slide-header">
        <SlideLogo />
      </div>

      <div className="onb-slide8-preview">
        <div className="onb-slide8-search">
          <span className="onb-slide8-search-icon">🔎</span>
          <span>Analyse.</span>
        </div>
        <div className="onb-slide8-card">
          <div className="onb-slide8-head">
            <span className="onb-slide8-head-check">{blocked ? lockIcon : "…"}</span>
            <span>Sites bloqués</span>
            <span className="onb-slide8-head-count">· {blocked ? "1249" : "1248"}</span>
          </div>

          <div className={`onb-slide8-site ${blocked ? "is-blocked" : ""}`}>
            <div className="onb-slide8-site-left">
              <div className="onb-slide8-site-logo is-xv">X</div>
              <div className="onb-slide8-site-copy">
                <strong>XVideos.com</strong>
                <small>{blocked ? "Bloqué" : "Blocage..."}</small>
              </div>
            </div>
            <div className="onb-slide8-site-status">{blocked ? lockIcon : "…"}</div>
          </div>

          <div className={`onb-slide8-site ${blocked ? "is-blocked" : ""}`}>
            <div className="onb-slide8-site-left">
              <div className="onb-slide8-site-logo is-ph">
                <span>Porn</span>
                <span>hub</span>
              </div>
              <div className="onb-slide8-site-copy">
                <strong>Pornhub.com</strong>
                <small>{blocked ? "Bloqué" : "Blocage..."}</small>
              </div>
            </div>
            <div className="onb-slide8-site-status">{blocked ? lockIcon : "…"}</div>
          </div>
        </div>
      </div>

      <div className="onb-slide-copy">
        <h2 className="onb-slide-title">Bloquez vos tentations</h2>
        <p className="onb-slide-message">
          Restez protégé grâce à un blocage privé qui élimine les tentations et casse le cycle.
        </p>
      </div>

      <div className="onb-slide6-dots">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i === 2 ? "onb-dot-active" : "onb-dot"} />
        ))}
      </div>

      <button className="onb-btn-gold onb-slide6-next" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide9: React.FC<CustomProps> = ({ goNext }) => {
  const apps = [
    "https://i.imgur.com/75sb9AW.png",
    "https://i.imgur.com/uGvCpcv.png",
    "https://i.imgur.com/iGhV3dq.png",
    "https://i.imgur.com/of9UJL3.png",
  ];

  return (
    <div className="onb-screen onb-black onb-slide9-screen">
      <div className="onb-slide-header">
        <SlideLogo />
      </div>

      <div className="onb-slide9-cluster">
        {apps.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            className={`onb-slide9-app onb-slide9-app-${i + 1}`}
            draggable={false}
            initial={{ y: 42, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              duration: 0.44,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
        <motion.img
          src="https://i.imgur.com/IMKlcAz.png"
          alt="Reddit"
          className="onb-slide9-reddit-img"
          draggable={false}
          initial={{ y: 42, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>

      <div className="onb-slide9-controls-wrap">
        <div className="onb-slide9-controls-top">
          <div className="onb-slide9-mini-btn">-</div>
          <div className="onb-slide9-time-pill">5 min</div>
          <div className="onb-slide9-mini-btn">+</div>
          <div className="onb-slide9-add-pill">+ Ajouter des apps</div>
        </div>
        <div className="onb-slide9-start-btn">Démarrer le blocage</div>
      </div>

      <div className="onb-slide-copy onb-slide9-copy">
        <h2 className="onb-slide-title">
          Limitez vos
          <br />
          déclencheurs
        </h2>
        <p className="onb-slide-message">
          Réduisez vos tentations en limitant le temps d’écran sur les applications qui vous déclenchent.
        </p>
      </div>

      <div className="onb-slide6-dots">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i === 3 ? "onb-dot-active" : "onb-dot"} />
        ))}
      </div>

      <button className="onb-btn-gold onb-slide6-next" onClick={goNext}>
        Suivant
      </button>
    </div>
  );
};

const CustomSlide10: React.FC<CustomProps> = ({ goNext }) => (
  <div className="onb-screen onb-black onb-slide10-screen">
    <div className="onb-slide-header">
      <SlideLogo />
    </div>

    <div className="onb-slide10-preview">
      <div className="onb-slide10-bell-wrap">
        <div className="onb-slide10-bell">
          <span className="onb-slide10-bell-icon">🔔</span>
          <span className="onb-slide10-badge">3</span>
        </div>
      </div>
      <div className="onb-slide10-notif">
        <img
          src="https://i.imgur.com/stMR5rL.png"
          alt="SOBRE"
          className="onb-slide10-notif-app"
          draggable={false}
        />
        <div className="onb-slide10-notif-copy">
          <div className="onb-slide10-notif-title">
            Il se fait tard... <small>Maintenant</small>
          </div>
          <div className="onb-slide10-notif-body">Pense à noter tes symptômes pour garder le cap.</div>
        </div>
      </div>
    </div>

    <div className="onb-slide-copy onb-slide10-copy">
      <h2 className="onb-slide-title">Reste sur la bonne voie</h2>
      <p className="onb-slide-message">
        Reste régulier grâce aux rappels, au suivi des séries et aux notifications motivantes — conçus pour te garder
        responsable et avancer.
      </p>
    </div>

    <div className="onb-slide6-dots">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i === 4 ? "onb-dot-active" : "onb-dot"} />
      ))}
    </div>

    <button className="onb-btn-gold onb-slide6-next" onClick={goNext}>
      Suivant
    </button>
  </div>
);

const CustomSlide11: React.FC<CustomProps> = ({ goNext }) => (
  <div className="onb-screen onb-black onb-slide11-screen">
    <div className="onb-slide-header">
      <SlideLogo />
    </div>

    <div className="onb-slide11-preview">
      <img src="https://i.imgur.com/yWky9d2.png" alt="" className="onb-slide11-avatar-big" />
      <div className="onb-slide11-chat-card">
        <div className="onb-slide11-msg-row is-left">
          <img src="https://i.imgur.com/yWky9d2.png" alt="" className="onb-slide11-msg-avatar" />
          <div className="onb-slide11-msg-bubble">
            Hey, je prends des nouvelles. Ces derniers jours ont été intenses... comment tu te sens ?
          </div>
        </div>
        <div className="onb-slide11-msg-row is-right">
          <div className="onb-slide11-msg-bubble">
            Honnêtement... je me perds dans le scroll et je replonge dès que ça devient difficile.
          </div>
          <img src="https://i.imgur.com/32zD9SI.png" alt="" className="onb-slide11-msg-avatar" />
        </div>
      </div>
    </div>

    <div className="onb-slide-copy onb-slide11-copy">
      <h2 className="onb-slide-title">Support personnalisé</h2>
      <p className="onb-slide-message">
        Ton assistant IA t’aide au quotidien avec des check-ins, des rappels et des conseils adaptés — pour avancer,
        même quand c’est dur.
      </p>
    </div>

    <div className="onb-slide6-dots">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i === 4 ? "onb-dot-active" : "onb-dot"} />
      ))}
    </div>

    <button className="onb-btn-gold onb-slide6-next" onClick={goNext}>
      Continuer
    </button>
  </div>
);

const CustomTestimonials: React.FC<CustomProps> = ({ goNext }) => {
  const items = [
    {
      name: "Kanye West",
      image: "https://i.imgur.com/s1k4cy2.png",
      text: "Mon addiction à la pornographie a détruit ma famille. Je suis en train de la combattre, et Dieu m'aide à retrouver ma liberté.",
      initial: "K",
    },
    {
      name: "Billie Eilish",
      image: "https://i.imgur.com/t9MhrJV.png",
      text: "J'ai vu du porno dès l'âge de 11 ans. Je pense que ça a ruiné mon cerveau.",
      initial: "B",
    },
    {
      name: "Viktor Frankl",
      image: "https://i.imgur.com/G4lIOEK.png",
      text: "Entre le stimulus et la réponse, il y a un espace. Et dans cet espace réside notre pouvoir de choisir.",
      initial: "V",
    },
    {
      name: "Connor",
      image: null,
      text: "Arrêter m'a permis de changer ma mentalité sur les petites choses de la vie.",
      initial: "C",
    },
    {
      name: "Finch",
      image: null,
      text: "Je vis enfin à la hauteur de mon potentiel et c'est incroyable.",
      initial: "F",
    },
    {
      name: "Anonyme",
      image: null,
      text: "La vie a retrouvé ses couleurs, et je suis enthousiaste pour l’avenir.",
      initial: "A",
    },
    {
      name: "Anonyme",
      image: null,
      text: "Je suis plus présent et engagé dans les conversations.",
      initial: "A",
    },
  ];

  return (
    <div className="onb-screen onb-black onb-testimonials-screen">
      <h2 className="onb-testimonials-title">Pourquoi des milliers décident d'arrêter</h2>
      <div className="onb-testimonials-list">
        {items.map((item, i) => (
          <article key={`${item.name}-${i}`} className="onb-testimonial-item">
            <div className="onb-testimonial-top">
              <div className={`onb-testimonial-avatar ${item.image ? "" : "is-fallback"}`}>
                {item.image ? <img src={item.image} alt={item.name} /> : item.initial}
              </div>
              <div className="onb-testimonial-name-line">
                <span>{item.name}</span>
                <span className="onb-testimonial-check">✓</span>
              </div>
            </div>
            <div className="onb-testimonial-bubble">{item.text}</div>
          </article>
        ))}
      </div>
      <div className="onb-testimonials-footer">
        <button className="onb-btn-white" onClick={goNext}>
          Continuer
        </button>
      </div>
    </div>
  );
};

const CustomPastAttempts: React.FC<CustomProps> = (p) => (
  <QuestionSingleChoiceScreen
    {...p}
    progressCurrent={1}
    progressTotal={1}
    title={"As-tu déjà essayé d’arrêter le porno ?\nComment ça s’est passé ?"}
    questionKey="past_porn_change_attempt"
    showSkip={false}
    choices={[
      { id: "yes_easy", label: "🙂 Oui, et ce n’était pas difficile" },
      { id: "yes_somewhat", label: "😓 Oui, mais c’était un peu difficile" },
      { id: "yes_very", label: "😣 Oui, et c’était très difficile" },
      { id: "no_first_time", label: "🆕 Non, c’est la première fois" },
    ]}
  />
);

const CustomRewiringAdvantages: React.FC<CustomProps> = ({ goNext }) => (
  <div className="onb-screen onb-gradient-gold onb-rewiring-screen">
    <div className="onb-rewiring-main">
      <img src="https://i.imgur.com/35ceOTL.png" alt="" className="onb-rewiring-logo" />
      <img src="https://i.imgur.com/J1R2Yrc.png" alt="" className="onb-rewiring-chart" />
      <p className="onb-rewiring-text">SOBRE vous aide à arrêter 76% plus rapidement que la seule volonté.</p>
    </div>
    <button className="onb-btn-light-gold" onClick={goNext}>
      Continuer
    </button>
  </div>
);

const CustomPersonalGoals: React.FC<CustomProps> = ({ goNext, goBack, answers, setAnswers }) => {
  const goals = [
    { id: "stop_completely", title: "🛑 Arrêter complètement" },
    { id: "improve_relationships", title: "❤️ Améliorer mes relations" },
    { id: "regain_energy", title: "⚡ Retrouver de l’énergie / de la motivation" },
    { id: "mental_clarity", title: "🧠 Améliorer ma clarté mentale" },
    { id: "reduce_anxiety", title: "🕊️ Réduire l’anxiété / retrouver la paix intérieure" },
  ];
  const [selected, setSelected] = useState<string[]>(answers.userGoals ?? []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleContinue = () => {
    if (!selected.length) return;
    setAnswers((prev) => ({ ...prev, userGoals: selected }));
    goNext();
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-sym-content">
        <h2 className="onb-title-lg">Définissons tes objectifs</h2>
        <p className="onb-helper">Sélectionne tout ce qui s’applique.</p>

        <div className="onb-goals-list">
          {goals.map((g) => (
            <button
              key={g.id}
              className={`onb-choice ${selected.includes(g.id) ? "is-selected" : ""}`}
              onClick={() => toggle(g.id)}
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      <div className="onb-sym-bottom">
        <button
          className={`onb-btn-gold ${selected.length ? "" : "is-disabled"}`}
          disabled={!selected.length}
          onClick={handleContinue}
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

const CustomCommitmentSignature: React.FC<CustomProps> = ({ goNext, goBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    const p = getPos(e);
    lastRef.current = p;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const p = getPos(e);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    if (!hasSignature) setHasSignature(true);
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    lastRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const clear = () => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <button className="onb-back-btn" onClick={goBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-sign-main">
        <h2 className="onb-title-lg">Signe ton engagement</h2>
        <p className="onb-helper">Fais une promesse à toi-même : arrêter la pornographie.</p>

        <div className="onb-sign-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={900}
            height={380}
            className="onb-sign-canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
          {!hasSignature && <div className="onb-sign-placeholder">✍️ Dessinez votre signature ici</div>}
        </div>

        {hasSignature ? (
          <button className="onb-sign-clear" onClick={clear}>
            Effacer
          </button>
        ) : null}

        <p className="onb-sign-hint">Dessinez dans l&apos;espace ouvert ci-dessus</p>
      </div>

      <div className="onb-sign-bottom">
        <button className={`onb-btn-gold ${hasSignature ? "" : "is-disabled"}`} disabled={!hasSignature} onClick={goNext}>
          Continuer
        </button>
      </div>
    </div>
  );
};

const CustomRateUs: React.FC<CustomProps> = ({ goNext }) => {
  const reviews = [
    {
      date: "8 mai",
      name: "Brandon S.",
      text: "Le blocage des sites a stoppé mon plus gros déclencheur.",
    },
    {
      date: "13 sept.",
      name: "Marcus L.",
      text: "90 jours clean grâce aux streaks et au soutien de la communauté.",
    },
    {
      date: "29 janv.",
      name: "Derek",
      text: "Je reprends le contrôle. C’est simple et ça m’aide vraiment.",
    },
    {
      date: "2 fév.",
      name: "Alex",
      text: "J’ai enfin de la clarté mentale et je suis plus motivé.",
    },
    {
      date: "6 juin",
      name: "Thomas",
      text: "Le diagnostic m’a fait un déclic. Je sais quoi faire maintenant.",
    },
    {
      date: "18 août",
      name: "Nolan",
      text: "Les rappels et le suivi m’aident à rester constant.",
    },
    {
      date: "12 oct.",
      name: "Yanis",
      text: "Je suis plus présent avec ma copine. Merci SOBRE.",
    },
    {
      date: "21 déc.",
      name: "Mat",
      text: "Je craque beaucoup moins. Je me sens enfin en contrôle.",
    },
  ];

  const rowTop = reviews.slice(0, 4);
  const rowBottom = reviews.slice(4);

  const twinkles = [
    { top: "9%", left: "7%", size: "8px", delay: "0s" },
    { top: "16%", left: "84%", size: "6px", delay: "0.6s" },
    { top: "28%", left: "20%", size: "7px", delay: "1.1s" },
    { top: "36%", left: "90%", size: "6px", delay: "0.2s" },
    { top: "52%", left: "10%", size: "8px", delay: "0.9s" },
    { top: "58%", left: "75%", size: "7px", delay: "1.4s" },
    { top: "69%", left: "30%", size: "6px", delay: "0.4s" },
    { top: "76%", left: "88%", size: "7px", delay: "1.8s" },
  ];

  return (
    <div className="onb-screen onb-rate-screen">
      <div className="onb-rate-bg" aria-hidden>
        {twinkles.map((s, i) => (
          <span
            key={i}
            className="onb-rate-bg-star"
            style={{
              top: s.top,
              left: s.left,
              fontSize: s.size,
              animationDelay: s.delay,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="onb-rate-top">
        <h2>
          Aide-nous à vaincre le
          <br />
          porno
        </h2>
        <p>Chaque note nous aide à lutter contre l’industrie du porno et à aider plus de personnes.</p>
        <div className="onb-rate-stars">★★★★★</div>
        <div className="onb-rate-kicker">Plus de 300 avis 5 étoiles</div>
        <div className="onb-rate-avatars">
          <img src="https://i.imgur.com/pMpaMOd.png" alt="" />
          <img src="https://i.imgur.com/4P80kpY.png" alt="" />
          <img src="https://i.imgur.com/By8HOi5.png" alt="" />
        </div>
        <div className="onb-rate-users">5k+ utilisateurs SOBRE</div>
      </div>

      <div className="onb-rate-marquee">
        <div className="onb-rate-row-wrap">
          <div className="onb-rate-row onb-rate-row-left">
            {[...rowTop, ...rowTop].map((r, i) => (
              <article key={`${r.name}-${r.date}-${i}`} className="onb-rate-card">
                <div className="onb-rate-card-top">
                  <small>{r.date}</small>
                  <span>★★★★★</span>
                </div>
                <h4>{r.name}</h4>
                <p>“{r.text}”</p>
              </article>
            ))}
          </div>
        </div>

        <div className="onb-rate-row-wrap">
          <div className="onb-rate-row onb-rate-row-right">
            {[...rowBottom, ...rowBottom].map((r, i) => (
              <article key={`${r.name}-${r.date}-b-${i}`} className="onb-rate-card">
                <div className="onb-rate-card-top">
                  <small>{r.date}</small>
                  <span>★★★★★</span>
                </div>
                <h4>{r.name}</h4>
                <p>“{r.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <button className="onb-btn-gold onb-rate-btn" onClick={goNext}>
        Continuer
      </button>
    </div>
  );
};

const CustomFreeTrial: React.FC<CustomProps & { checkoutEmail: string }> = ({ goBack, goNext, answers, checkoutEmail }) => {
  const [phase, setPhase] = useState<"scratch" | "reveal">("scratch");
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const scratchHostRef = useRef<HTMLDivElement | null>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const scratchedCellsRef = useRef<Uint8Array | null>(null);
  const scratchedCountRef = useRef(0);
  const revealedRef = useRef(false);
  const promoCode = useMemo(() => buildPromoCode(answers.personalData?.firstName, "50"), [answers.personalData?.firstName]);

  const GRID_SIZE = 36;
  const REVEAL_THRESHOLD = 28;
  const BRUSH_RADIUS = 28;

  const setupScratchLayer = useCallback(() => {
    const host = scratchHostRef.current;
    const canvas = scratchCanvasRef.current;
    if (!host || !canvas) return;

    const rect = host.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#2e2e31");
    gradient.addColorStop(0.5, "#39393d");
    gradient.addColorStop(1, "#2b2b2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + 6);
      ctx.stroke();
    }

    scratchedCellsRef.current = new Uint8Array(GRID_SIZE * GRID_SIZE);
    scratchedCountRef.current = 0;
    setScratchProgress(0);
    revealedRef.current = false;
  }, []);

  useEffect(() => {
    if (phase !== "scratch") return;
    setupScratchLayer();
    const onResize = () => setupScratchLayer();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase, setupScratchLayer]);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const updateProgressAt = (x: number, y: number, radius: number) => {
    const canvas = scratchCanvasRef.current;
    const cells = scratchedCellsRef.current;
    if (!canvas || !cells) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;

    const minX = Math.max(0, Math.floor(((x - radius) / w) * GRID_SIZE));
    const maxX = Math.min(GRID_SIZE - 1, Math.floor(((x + radius) / w) * GRID_SIZE));
    const minY = Math.max(0, Math.floor(((y - radius) / h) * GRID_SIZE));
    const maxY = Math.min(GRID_SIZE - 1, Math.floor(((y + radius) / h) * GRID_SIZE));

    for (let gy = minY; gy <= maxY; gy += 1) {
      for (let gx = minX; gx <= maxX; gx += 1) {
        const cellCenterX = ((gx + 0.5) / GRID_SIZE) * w;
        const cellCenterY = ((gy + 0.5) / GRID_SIZE) * h;
        const dx = cellCenterX - x;
        const dy = cellCenterY - y;
        if (dx * dx + dy * dy <= radius * radius) {
          const idx = gy * GRID_SIZE + gx;
          if (!cells[idx]) {
            cells[idx] = 1;
            scratchedCountRef.current += 1;
          }
        }
      }
    }

    const pct = (scratchedCountRef.current / cells.length) * 100;
    setScratchProgress(pct);
    if (pct >= REVEAL_THRESHOLD && !revealedRef.current) {
      revealedRef.current = true;
      setIsRevealing(true);
      window.setTimeout(() => {
        setPhase("reveal");
        setIsScratching(false);
        setIsRevealing(false);
        setIsDrawing(false);
      }, 320);
    }
  };

  const eraseAt = (x: number, y: number, from?: { x: number; y: number } | null) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH_RADIUS * 2;

    if (from) {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    updateProgressAt(x, y, BRUSH_RADIUS + 4);
  };

  const handleBack = () => {
    if (phase === "reveal") {
      setPhase("scratch");
      setIsScratching(false);
      setScratchProgress(0);
      setIsRevealing(false);
      setIsDrawing(false);
      return;
    }
    goBack();
  };

  const onScratchStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealing) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    setIsDrawing(true);
    setIsScratching(true);
    lastPointRef.current = point;
    eraseAt(point.x, point.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onScratchMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isRevealing) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    eraseAt(point.x, point.y, lastPointRef.current);
    lastPointRef.current = point;
  };

  const onScratchEnd = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    setIsScratching(false);
    lastPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="onb-screen onb-black onb-offer-screen">
      <div className="onb-question-header">
        <button className="onb-back-btn" onClick={handleBack} aria-label="Retour">
          {"\u2190"}
        </button>
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
      </div>

      {phase === "scratch" ? (
        <div className="onb-offer-main">
          <div className="onb-offer-pill">OFFRE SOBRE</div>
          <h2 className="onb-offer-title">
            Gratte ton ticket
            <br />
            et découvre ton offre
          </h2>
          <p className="onb-offer-subtitle">Une réduction exclusive t’attend pour démarrer maintenant.</p>

          <button
            className={`onb-offer-scratch ${isScratching ? "is-scratching" : ""} ${isRevealing ? "is-revealing" : ""}`}
            aria-label="Gratter le ticket"
            ref={scratchHostRef}
          >
            <span className="onb-offer-scratch-progress">{Math.floor(scratchProgress)}%</span>
            <span className="onb-offer-scratch-text">Gratte ici</span>
            <span className="onb-offer-scratch-shine" />
            <canvas
              ref={scratchCanvasRef}
              className="onb-offer-scratch-canvas"
              onPointerDown={onScratchStart}
              onPointerMove={onScratchMove}
              onPointerUp={onScratchEnd}
              onPointerCancel={onScratchEnd}
              onPointerLeave={onScratchEnd}
            />
          </button>
        </div>
      ) : (
        <div className="onb-offer-main onb-offer-main-revealed">
          <div className="onb-offer-pill">OFFRE REVELEE</div>
          <h2 className="onb-offer-title">
            Bravo, tu as
            <br />
            -50% de réduction
          </h2>

          <div className="onb-offer-card onb-offer-card-pop">
            <div className="onb-offer-card-main">50%</div>
            <div className="onb-offer-card-sub">OFF</div>
            <div className="onb-offer-card-foot">OFFRE LIMITEE</div>
            <div className="onb-offer-card-code">CODE_PROMO : {promoCode}</div>
            <span className="onb-offer-spark onb-offer-spark-1" />
            <span className="onb-offer-spark onb-offer-spark-2" />
            <span className="onb-offer-spark onb-offer-spark-3" />
          </div>
        </div>
      )}

      {phase === "reveal" && (
        <button
          className="onb-btn-gold onb-offer-btn"
          onClick={() => {
            try {
              const isIAB = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A/.test(navigator.userAgent);
              const isIOS = /iPhone|iPad/.test(navigator.userAgent);
              const isAndroid = /Android/.test(navigator.userAgent);
              alert("isIAB: " + isIAB + " | isIOS: " + isIOS + " | isAndroid: " + isAndroid + " | email: " + checkoutEmail);
              if (isIAB && (isIOS || isAndroid)) {
                const url = new URL(window.location.href);
                url.searchParams.set("step", "trial-reminder");
                if (checkoutEmail) {
                  url.searchParams.set("email", btoa(unescape(encodeURIComponent(checkoutEmail))));
                }
                const targetUrl = url.toString();
                alert("IAB redirect → " + targetUrl);
                if (isIOS) {
                  window.location.href = targetUrl.replace("https://", "x-safari-https://");
                } else {
                  window.location.href = targetUrl.replace("https://", "googlechrome://");
                }
              } else {
                goNext();
              }
            } catch (err) {
              alert("ERREUR: " + (err instanceof Error ? err.message : String(err)));
              goNext();
            }
          }}
        >
          Récupérer ma réduction
        </button>
      )}
    </div>
  );
};

const CustomPersonalizedSummary: React.FC<CustomProps> = ({ goNext, answers }) => {
  type RoadmapItem = {
    icon: string;
    title: string;
    description: string;
    highlight?: boolean;
  };

  const userName = answers.personalData?.firstName?.trim() || "";
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const roadmap = useMemo<RoadmapItem[]>(() => [
    {
      icon: "🛠️",
      title: "Jour 0 — Préparer ton espace",
      description: "Optimise ton environnement (physique & digital) pour rendre le changement plus simple.",
    },
    {
      icon: "🧭",
      title: "Jour 1 — Déjouer le sevrage",
      description: "Utilise des outils mentaux et physiques pour traverser les envies et te recentrer.",
    },
    {
      icon: "🔁",
      title: "Jour 2 — Battre le jeu des envies",
      description: "Repère tes déclencheurs et remplace-les par des habitudes plus saines et gratifiantes.",
    },
    {
      icon: "🧠",
      title: "Dès le jour 2, ton cerveau commence à se réinitialiser.",
      description:
        "La dopamine commence à se stabiliser. Les envies peuvent monter au début, mais c'est un signe clair que la guérison a commencé.",
      highlight: true,
    },
    {
      icon: "🔥",
      title: "Jour 3 — Renforcer ton “pourquoi”",
      description: "Transforme tes raisons profondes en motivation quotidienne et en focus.",
    },
    {
      icon: "🧹",
      title: "Jour 4 — Écraser les symptômes",
      description: "Apprends à gérer la fatigue, le stress ou l'irritabilité avec des “resets” simples.",
    },
    {
      icon: "✨",
      title: "Ton focus revient vite.",
      description:
        "Le brouillard mental commence à se lever et la motivation revient. Sommeil, énergie et clarté sont juste au coin de la rue.",
      highlight: true,
    },
    {
      icon: "💪",
      title: "Jour 5 — Se sentir mieux dans son corps",
      description: "Bouge, mange mieux et recharge : ton énergie et ta clarté peuvent revenir rapidement.",
    },
    {
      icon: "🤝",
      title: "Jour 6 — Tu n'es pas seul",
      description: "Connecte-toi à d'autres sur le même chemin. Partage tes victoires et reçois du soutien.",
    },
    {
      icon: "📍",
      title: "Jour 7 — Reprendre ton temps",
      description: "Remplace les anciennes habitudes par de vrais objectifs et des actions qui comptent.",
    },
    {
      icon: "📈",
      title: "Fin de la semaine 1 — stats & élan",
      description:
        "Les envies sont encore là, mais plus faciles à gérer. Énergie, confiance et motivation se renforcent : c'est ton premier vrai goût de liberté.",
      highlight: true,
    },
   ], []);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [cardYPositions, setCardYPositions] = useState<number[]>([]);

  const measureCards = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const nextPositions = roadmap.map((_, index) => {
      const card = cardRefs.current[index];
      if (!card) return 0;
      const rect = card.getBoundingClientRect();
      return rect.top - containerRect.top + container.scrollTop;
    });

    setViewportHeight(container.clientHeight);
    setCardYPositions(nextPositions);
  }, [roadmap]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let rafId = 0;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(container.scrollTop);
      });
    };

    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    measureCards();
    const first = window.setTimeout(measureCards, 80);
    const second = window.setTimeout(measureCards, 320);
    window.addEventListener("resize", measureCards);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.removeEventListener("resize", measureCards);
    };
  }, [measureCards]);

  const getCardProgress = (index: number) => {
    if (!viewportHeight) return 1;
    const cardY = cardYPositions[index] ?? 0;
    const start = cardY - viewportHeight + 36;
    const end = start + 140;
    return clamp01((scrollY - start) / (end - start));
  };

  return (
    <div className="onb-screen onb-black onb-summary-screen">
      <div className="onb-summary-scroll" ref={scrollRef}>
        <div className="onb-summary-logo-wrap">
          <img src="https://i.imgur.com/stMR5rL.png" alt="SOBRE" className="onb-summary-logo" />
        </div>

        <motion.h2
          className="onb-summary-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {userName ? `${userName}, voici ton plan personnalisé.` : "Voici ton plan personnalisé."}
        </motion.h2>

        <motion.div
          className="onb-summary-datebox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        >
          <span>Tu seras sobre à partir du :</span>
          <strong>{targetDate}</strong>
        </motion.div>

        <p className="onb-summary-lead">Ce n’est pas une question de volonté.</p>
        <p className="onb-summary-sub">C’est un système qui fonctionne vraiment.</p>
        <p className="onb-summary-body">
          SOBRE te guide à travers un reset puissant, avec une structure et des outils qui t'aident à progresser,
          même quand c'est difficile.
        </p>
        <p className="onb-summary-kicker">Voici à quoi ressemblent tes 7 premiers jours :</p>

        <div className="onb-summary-roadmap">
          {roadmap.map((item, index) => {
            const progress = getCardProgress(index);
            return (
              <article
                key={item.title}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`onb-summary-item ${item.highlight ? "is-highlight" : ""}`}
                style={{
                  opacity: progress,
                  transform: `translateY(${(1 - progress) * 18}px)`,
                  willChange: "opacity, transform",
                }}
              >
                <div className="onb-summary-item-icon">{item.icon}</div>
                <div className="onb-summary-item-copy">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <motion.div
        className="onb-summary-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
      >
        <div className="onb-summary-pill">✅ Sans engagement, annule quand tu veux</div>
        <button className="onb-btn-gold" onClick={goNext}>
          Continuer
        </button>
      </motion.div>
    </div>
  );
};

const CustomEmailCapture: React.FC<
  CustomProps & {
    checkoutEmail: string;
    setCheckoutEmail: (value: string) => void;
    preparedCheckout: PreparedCheckout | null;
    prepareCheckout: (args: { email: string; plan: CheckoutPlan; offer: string }) => Promise<PreparedCheckout>;
    clearPreparedCheckout: () => void;
  }
> = ({
  goNext,
  checkoutEmail,
  setCheckoutEmail,
  preparedCheckout,
  prepareCheckout,
  clearPreparedCheckout,
}) => {
  const posthog = usePostHog();
  const [checkoutEmailError, setCheckoutEmailError] = useState("");
  const offerLevel = "50";
  const normalizedCheckoutEmail = checkoutEmail.trim().toLowerCase();
  const isCheckoutEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCheckoutEmail);

  const handleEmailChange = (value: string) => {
    setCheckoutEmail(value);
    if (checkoutEmailError) setCheckoutEmailError("");
    if (preparedCheckout && preparedCheckout.email !== value.trim().toLowerCase()) {
      clearPreparedCheckout();
    }
  };

  const handleContinue = () => {
    if (!isCheckoutEmailValid) {
      setCheckoutEmailError("Champ requis");
      return;
    }

    setCheckoutEmailError("");
    if (posthog && normalizedCheckoutEmail) {
      const distinctId = posthog.get_distinct_id();
      posthog.identify(distinctId, {
        email: normalizedCheckoutEmail,
        flow_version: FLOW_VERSION,
      });
      if (posthog.people?.set) {
        posthog.people.set({
          email: normalizedCheckoutEmail,
          flow_version: FLOW_VERSION,
        });
      }
    }
    void prepareCheckout({
      email: normalizedCheckoutEmail,
      plan: "month",
      offer: offerLevel,
    }).catch((err) => {
      console.warn("Prepare checkout failed:", err);
    });
    goNext();
  };

  return (
    <div className="onb-screen onb-black">
      <div className="onb-question-header">
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-question-motion">
        <div className="onb-question-content">
          <h2 className="onb-title-lg">Entre ton email pour obtenir ton plan personnalisé</h2>

          <div className="onb-email-field">
            <label className="onb-helper" htmlFor="checkout-email">
              Email
            </label>
            <input
              id="checkout-email"
              className="onb-input"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              placeholder="ton@email.com"
              value={checkoutEmail}
              onChange={(event) => handleEmailChange(event.target.value)}
            />
            {checkoutEmailError ? (
              <p className="onb-checkout-email-error">{checkoutEmailError}</p>
            ) : null}
            <p className="onb-paywall-legal">Tu utiliseras cet email pour te connecter dans l'app.</p>
          </div>
        </div>
      </div>

      <div className="onb-question-bottom onb-email-actions">
        <button type="button" className="onb-btn-gold onb-trial-btn" onClick={handleContinue}>
          Continuer
        </button>
      </div>
    </div>
  );
};

const CustomTrialReminder: React.FC<
  CustomProps & {
    checkoutEmail: string;
    preparedCheckout: PreparedCheckout | null;
    prepareCheckout: (args: { email: string; plan: CheckoutPlan; offer: string }) => Promise<PreparedCheckout>;
    clearPreparedCheckout: () => void;
    goToEmailStep: () => void;
  }
> = ({
  goBack,
  goToEmailStep,
  answers,
  checkoutEmail,
  preparedCheckout,
  prepareCheckout,
  clearPreparedCheckout,
}) => {
  const posthog = usePostHog();
  const OFFER_TIMER_SECONDS_50 = 10 * 60;
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OFFER_TIMER_SECONDS_50);
  const [selectedPlan, setSelectedPlan] = useState<CheckoutPlan>("year");
  const promoCode = useMemo(() => buildPromoCode(answers.personalData?.firstName, "50"), [answers.personalData?.firstName]);
  const trialMainRef = useRef<HTMLDivElement | null>(null);
  const pricingSectionRef = useRef<HTMLElement | null>(null);
  const paymentMethodsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    trackMetaEventOnce("ViewContent:paywall-trial-reminder-50", "ViewContent", {
      content_name: "Sobre Paywall -50%",
      content_type: "product_group",
      currency: "EUR",
    });
  }, []);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const offerLevel = "50";
  const normalizedCheckoutEmail = checkoutEmail.trim().toLowerCase();
  const isCheckoutEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCheckoutEmail);
  const prices =
    selectedPlan === "month"
      ? { original: "19,99€", discounted: "9,99€ / mois", saved: "10,00€" }
      : { original: "59,99€", discounted: "29,99€ / an", saved: "30,00€" };

  const handlePlanChange = (plan: CheckoutPlan) => {
    if (plan === selectedPlan) return;
    setSelectedPlan(plan);
    if (preparedCheckout && preparedCheckout.plan !== plan) {
      clearPreparedCheckout();
    }
    if (isCheckoutEmailValid) {
      void prepareCheckout({
        email: normalizedCheckoutEmail,
        plan,
        offer: offerLevel,
      }).catch(() => {});
    }
  };

  const startCheckout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const identity = readFunnelIdentityFromSearch(window.location.search);
      const checkoutIdentityError = getCheckoutIdentityError(identity);
      if (checkoutIdentityError) throw new Error(checkoutIdentityError);
      if (!isCheckoutEmailValid) {
        setLoading(false);
        goToEmailStep();
        return;
      }
      const purchaseValue = selectedPlan === "month" ? 9.99 : 29.99;

      savePendingPurchase({ value: purchaseValue, currency: "EUR" });
      savePendingCheckout({
        currency: "EUR",
        offerName: "intro_50",
        planType: selectedPlan,
        price: purchaseValue,
      });
      capturePostHogEvent(
        posthog,
        "checkout_started",
        withFlowVersion({
          currency: "EUR",
          offer_name: "intro_50",
          plan_type: selectedPlan,
          price: purchaseValue,
        })
      );
      trackMetaEvent("InitiateCheckout", {
        currency: "EUR",
        value: purchaseValue,
      });
      let checkoutUrl = "";

      if (
        preparedCheckout &&
        preparedCheckout.email === normalizedCheckoutEmail &&
        preparedCheckout.plan === selectedPlan &&
        preparedCheckout.offer === offerLevel
      ) {
        checkoutUrl = preparedCheckout.url;
      } else {
        const prepared = await prepareCheckout({
          email: normalizedCheckoutEmail,
          plan: selectedPlan,
          offer: offerLevel,
        });
        checkoutUrl = prepared.url;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
      const message = err instanceof Error ? err.message : "Impossible de lancer le paiement pour le moment.";
      alert(message);
    }
  };

  const scrollToPaymentMethods = () => {
    const target = paymentMethodsRef.current;
    if (!target) return;

    const container = trialMainRef.current;
    if (container && container.scrollHeight > container.clientHeight + 4) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const destinationTop = Math.max(0, container.scrollTop + (targetRect.top - containerRect.top) - 10);
      container.scrollTo({ top: destinationTop, behavior: "smooth" });
      return;
    }

    const targetTop = window.scrollY + target.getBoundingClientRect().top - 10;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  return (
    <div className="onb-screen onb-black onb-trial-screen">
      <div className="onb-question-header">
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
        <div className="onb-header-spacer" />
      </div>

      <div className="onb-trial-main" ref={trialMainRef}>
        <section className="onb-paywall-timer-wrap">
          <p className="onb-paywall-timer-kicker">Offre -{offerLevel}% expirera dans</p>
          <div className="onb-paywall-timer-row">
            <div className="onb-paywall-timer">
              <span>{minutes}</span>:<span>{seconds}</span>
            </div>
            <button type="button" className="onb-paywall-timer-cta" onClick={scrollToPaymentMethods}>
              Obtenir mon plan
            </button>
          </div>
        </section>

        <section className="onb-paywall-hero">
          <div className="onb-paywall-hero-badge">Transformation claire</div>
          <h2>Ton plan SOBRE personnalisé</h2>
          <p>Un système concret pour reprendre le contrôle jour après jour.</p>
          <div className="onb-paywall-compare">
            <article className="onb-paywall-compare-card is-before">
              <span className="onb-paywall-compare-tag">Avant</span>
              <h3>Sans SOBRE</h3>
              <img
                className="onb-paywall-compare-visual"
                src="https://i.imgur.com/fBgv5QO.png"
                alt="Avant: état actuel sans Sobre"
                loading="lazy"
              />
              <ul>
                <li>Motivation instable</li>
                <li>Envies difficiles à gérer</li>
                <li>Progrès irréguliers</li>
              </ul>
            </article>
            <article className="onb-paywall-compare-card is-after">
              <span className="onb-paywall-compare-tag">Après</span>
              <h3>Avec SOBRE</h3>
              <img
                className="onb-paywall-compare-visual"
                src="https://i.imgur.com/jf9Uaiz.png"
                alt="Après: progression avec Sobre"
                loading="lazy"
              />
              <ul>
                <li>Routines solides</li>
                <li>Plan simple à suivre</li>
                <li>Progression claire et mesurable</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="onb-paywall-list">
          <h3>Comment atteindre ton objectif avec SOBRE</h3>
          <p>🛑 Active le blocage des apps et contenus déclencheurs</p>
          <p>🚨 Utilise les outils d’urgence quand une envie apparaît</p>
          <p>👥 Avance avec la communauté SOBRE</p>
          <p>🧠 Suis la méthode basée sur les neurosciences</p>
          <p>📈 Suis ta progression jour après jour</p>
          <p>🎯 Complète le programme Detox 30-60-90</p>
        </section>

        <section className="onb-paywall-proof">
          <h3>Ils avancent avec SOBRE</h3>
          <div className="onb-paywall-reviews">
            <blockquote>
              <div className="onb-review-stars">★★★★★</div>
              <p className="onb-review-quote">"En 10 jours j’ai retrouvé de la clarté."</p>
              <div className="onb-review-meta">— Lucas · 10 jours</div>
            </blockquote>
            <blockquote>
              <div className="onb-review-stars">★★★★★</div>
              <p className="onb-review-quote">"Le suivi quotidien m’aide vraiment à tenir."</p>
              <div className="onb-review-meta">— Thomas · 3 semaines</div>
            </blockquote>
            <blockquote>
              <div className="onb-review-stars">★★★★★</div>
              <p className="onb-review-quote">"Simple, concret, efficace."</p>
              <div className="onb-review-meta">— Marc · 4 mois</div>
            </blockquote>
          </div>
        </section>

        <section className="onb-paywall-pricing" ref={pricingSectionRef}>
          <h3>Choisis ton plan</h3>
          <div className="onb-pricing-promo">
            <div className="onb-pricing-promo-head">✅ Code promo appliqué</div>
            <div className="onb-pricing-promo-row">
              <span className="onb-pricing-promo-code">{promoCode}</span>
              <span className="onb-pricing-promo-timer">{minutes}:{seconds}</span>
            </div>
          </div>

          <article
            className={`onb-paywall-plan ${selectedPlan === "month" ? "is-selected" : ""}`}
            onClick={() => handlePlanChange("month")}
          >
            <div>
              <strong>Plan Mensuel</strong>
              <p>
                <s>19,99€</s> <span>-${offerLevel}%</span>
              </p>
            </div>
            <div className="onb-paywall-price">9,99€ / mois</div>
          </article>

          <article
            className={`onb-paywall-plan ${selectedPlan === "year" ? "is-selected" : ""}`}
            onClick={() => handlePlanChange("year")}
          >
            <div>
              <strong>Plan Annuel</strong>
              <p>
                <s>59,99€</s> <span>-${offerLevel}%</span>
              </p>
            </div>
            <div className="onb-paywall-price">29,99€ / an</div>
          </article>

        </section>

        <section className="onb-checkout-block">
          <h3>
            Rejoins plus de <span>5000 utilisateurs</span>
            <br />
            qui reprennent le contrôle avec SOBRE
          </h3>

          <div className="onb-checkout-card">
            <h4>Paiement sécurisé</h4>

            <div className="onb-checkout-row">
              <span>SOBRE Premium</span>
              <strong>{prices.original}</strong>
            </div>
            <div className="onb-checkout-row is-discount">
              <span>Offre d’introduction -{offerLevel}%</span>
              <strong>-{prices.saved}</strong>
            </div>
            <div className="onb-checkout-code">CODE_PROMO : {promoCode}</div>

            <div className="onb-checkout-total">
              <span>Total</span>
              <strong>{prices.discounted}</strong>
            </div>
            
            <div className="onb-payment-methods" ref={paymentMethodsRef}>
              <button className="onb-checkout-confirm" onClick={startCheckout} disabled={loading}>
                Commencer ma transformation
              </button>
            </div>

          </div>

          <div className="onb-checkout-meta">
            <p className="onb-checkout-disclaimer">
              En cliquant sur “Activer l’abonnement”, tu acceptes le renouvellement automatique. Annulation à tout
              moment depuis les réglages de ton compte.
            </p>
            <div className="onb-checkout-trust">✅ Paiement sûr et sécurisé</div>
            <div className="onb-checkout-brands" aria-label="Moyens de paiement pris en charge">
              <span>Apple Pay</span>
              <span>VISA</span>
              <span>Mastercard</span>
              <span>AMEX</span>
            </div>
          </div>
        </section>
      </div>

      <div className="onb-paywall-cta-wrap">
        <button className="onb-btn-gold onb-trial-btn" onClick={startCheckout} disabled={loading}>
          {loading ? "Chargement..." : "Commencer maintenant"}
        </button>
        <p className="onb-paywall-legal">Annulation à tout moment</p>
      </div>
    </div>
  );
};
export default function OnboardingFirst5({ onDone, onLoginClick }: Props) {
  const posthog = usePostHog();
  const [checkoutEmail, setCheckoutEmailState] = useState("");
  const [preparedCheckout, setPreparedCheckout] = useState<PreparedCheckout | null>(null);
  const preparePromiseRef = useRef<Promise<PreparedCheckout> | null>(null);
  const prepareKeyRef = useRef("");

  const clearPreparedCheckout = useCallback(() => {
    setPreparedCheckout(null);
    preparePromiseRef.current = null;
    prepareKeyRef.current = "";
  }, []);

  const setCheckoutEmail = useCallback(
    (value: string) => {
      setCheckoutEmailState(value);
      const normalized = value.trim().toLowerCase();
      if (preparedCheckout && preparedCheckout.email !== normalized) {
        clearPreparedCheckout();
      }
    },
    [clearPreparedCheckout, preparedCheckout]
  );

  const prepareCheckout = useCallback(
    async ({ email, plan, offer }: { email: string; plan: CheckoutPlan; offer: string }) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("email manquant");

      const identity = readFunnelIdentityFromSearch(window.location.search);
      const checkoutIdentityError = getCheckoutIdentityError(identity);
      if (checkoutIdentityError) throw new Error(checkoutIdentityError);

      const key = `${normalizedEmail}|${plan}|${offer}|${identity.userId || "anonymous"}`;
      if (preparedCheckout && preparedCheckout.key === key) return preparedCheckout;
      if (prepareKeyRef.current === key && preparePromiseRef.current) {
        return preparePromiseRef.current;
      }

      prepareKeyRef.current = key;

      const promise = (async () => {
        const API_BASE_URL = getApiBaseUrl();
        const res = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            plan,
            offer,
            userId: identity.userId,
            userIdTs: identity.userIdTs,
            userIdSig: identity.userIdSig,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.url) {
          throw new Error(data?.error || "Erreur checkout");
        }

        const prepared = { key, url: data.url, email: normalizedEmail, plan, offer };
        setPreparedCheckout(prepared);
        return prepared;
      })().catch((err) => {
        if (prepareKeyRef.current === key) {
          setPreparedCheckout(null);
          preparePromiseRef.current = null;
          prepareKeyRef.current = "";
        }
        throw err;
      });

      preparePromiseRef.current = promise;
      return promise;
    },
    [preparedCheckout]
  );

  const [stepIndex, setStepIndex] = useState(() => {
    const stepParam = new URLSearchParams(window.location.search).get("step");
    if (!stepParam || stepParam === "trial-reminder") {
      const trialReminderIndex = STEP_ORDER.indexOf("trial-reminder");
      return trialReminderIndex >= 0 ? trialReminderIndex : 0;
    }
    const requestedStepIndex = STEP_ORDER.indexOf(stepParam as StepId);
    return requestedStepIndex >= 0 ? requestedStepIndex : 0;
  });
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Answers>({ quizAnswers: {} });
  const landingViewCapturedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step")) return;

    params.set("step", "trial-reminder");
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") !== "trial-reminder") return;
    const emailParam = params.get("email");
    if (!emailParam) return;
    try {
      const decoded = atob(emailParam).trim().toLowerCase();
      if (!decoded || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decoded)) return;
      setCheckoutEmail(decoded);
      void prepareCheckout({ email: decoded, plan: "year", offer: "50" }).catch(() => {});
    } catch {
      // base64 invalide, on ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = STEP_ORDER[stepIndex];
  const activePageVariants = CINEMATIC_SLIDE_STEPS.includes(step)
    ? cinematicPageVariants
    : defaultPageVariants;

  useEffect(() => {
    if (posthog && !landingViewCapturedRef.current) {
      const { pathname, search } = window.location;
      capturePostHogEvent(posthog, "landing_view", withFlowVersion({ path: pathname, search }));
      landingViewCapturedRef.current = true;
    }

    const stepProperties = {
      step_index: stepIndex + 1,
      step_name: step,
      step_group: getStepGroup(step),
    };

    capturePostHogEventOnce(
      posthog,
      `onboarding_step_viewed:${step}`,
      "onboarding_step_viewed",
      withFlowVersion(stepProperties)
    );

    if (step === "index") {
      capturePostHogEventOnce(
        posthog,
        "onboarding_started",
        "onboarding_started",
        withFlowVersion(stepProperties)
      );
    }

    if (step === "trial-reminder") {
      capturePostHogEventOnce(
        posthog,
        "onboarding_completed",
        "onboarding_completed",
        withFlowVersion(stepProperties)
      );
      capturePostHogEventOnce(posthog, "paywall_viewed:intro_50", "paywall_viewed", {
        ...withFlowVersion(stepProperties),
        currency: "EUR",
        offer_name: "intro_50",
      });
    }
  }, [posthog, step, stepIndex]);

  const goNext = () => {
    if (stepIndex >= STEP_ORDER.length - 1) {
      onDone?.(answers);
      return;
    }
    setDirection(1);
    setStepIndex((v) => v + 1);
  };

  const goBack = () => {
    if (stepIndex <= 0) return;
    setDirection(-1);
    setStepIndex((v) => v - 1);
  };

  const goToEmailStep = useCallback(() => {
    const targetIndex = STEP_ORDER.indexOf("email-capture");
    if (targetIndex < 0) return;
    setDirection(targetIndex >= stepIndex ? 1 : -1);
    setStepIndex(targetIndex);
  }, [stepIndex]);

  const customComponents: Record<
    StepId,
    React.ComponentType<CustomProps>
  > = useMemo(
    () => ({
      index: (p) => <CustomWelcomeIntro {...p} onLoginClick={onLoginClick} />,
      story: CustomStory,
      "personal-data": CustomPersonalData,
      "consider-this": CustomConsiderThis,
      "question-1": CustomQuestion1,
      "question-2": CustomQuestion2,
      "question-3": CustomQuestion3,
      "youre-in-the-right-place": CustomYoureInTheRightPlace,
      "question-4": CustomQuestion4,
      "question-5": CustomQuestion5,
      "question-6": CustomQuestion6,
      "question-8": CustomQuestion8,
      "question-9": CustomQuestion9,
      "question-10": CustomQuestion10,
      "question-11": CustomQuestion11,
      "question-12": CustomQuestion12,
      "question-13": CustomQuestion13,
      loading: CustomLoading,
      results: CustomResults,
      symptoms: CustomSymptoms,
      "slide-3": CustomSlide3,
      "slide-1": CustomSlide1,
      "slide-2": CustomSlide2,
      "slide-4": CustomSlide4,
      "slide-6": CustomSlide6,
      "slide-7": CustomSlide7,
      "slide-8": CustomSlide8,
      "slide-9": CustomSlide9,
      "slide-10": CustomSlide10,
      "slide-11": CustomSlide11,
      testimonials: CustomTestimonials,
      "past-attempts": CustomPastAttempts,
      "rewiring-advantages": CustomRewiringAdvantages,
      "personal-goals": CustomPersonalGoals,
      "commitment-signature": CustomCommitmentSignature,
      "rate-us": CustomRateUs,
      "personalized-summary": CustomPersonalizedSummary,
      "free-trial": CustomFreeTrial,
    }),
    [onLoginClick]
  );

  const StepComponent = customComponents[step];

  return (
    <div className="onb-root">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          className="onb-page"
          custom={direction}
          variants={activePageVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {step === "email-capture" ? (
            <CustomEmailCapture
              step={step}
              goNext={goNext}
              goBack={goBack}
              answers={answers}
              setAnswers={setAnswers}
              checkoutEmail={checkoutEmail}
              setCheckoutEmail={setCheckoutEmail}
              preparedCheckout={preparedCheckout}
              prepareCheckout={prepareCheckout}
              clearPreparedCheckout={clearPreparedCheckout}
            />
          ) : step === "trial-reminder" ? (
            <CustomTrialReminder
              step={step}
              goNext={goNext}
              goBack={goBack}
              answers={answers}
              setAnswers={setAnswers}
              checkoutEmail={checkoutEmail}
              preparedCheckout={preparedCheckout}
              prepareCheckout={prepareCheckout}
              clearPreparedCheckout={clearPreparedCheckout}
              goToEmailStep={goToEmailStep}
            />
          ) : step === "free-trial" ? (
            <CustomFreeTrial
              step={step}
              goNext={goNext}
              goBack={goBack}
              answers={answers}
              setAnswers={setAnswers}
              checkoutEmail={checkoutEmail}
            />
          ) : (
            <StepComponent
              step={step}
              goNext={goNext}
              goBack={goBack}
              answers={answers}
              setAnswers={setAnswers}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
