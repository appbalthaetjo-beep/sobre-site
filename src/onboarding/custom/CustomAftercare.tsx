import { useMemo, useState } from 'react';
import type { CustomProps } from './types';

function ContinueButton({ step, goNext }: Pick<CustomProps, 'step' | 'goNext'>) {
  if (!step.nav?.next) return null;

  return (
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
  );
}

export function CustomTestimonialsFeed({ step, goNext }: CustomProps) {
  const quotes = [
    'Mon addiction à la pornographie a détruit ma famille. Je suis en train de la combattre, et Dieu m’aide à retrouver ma liberté.',
    'J’ai vu du porno dès l’âge de 11 ans. Je pense que ça a ruiné mon cerveau.',
    'Entre le stimulus et la réponse, il y a un espace. Et dans cet espace réside notre pouvoir de choisir.',
    'Arrêter m’a permis de changer ma mentalité sur les petites choses de la vie.',
    'Je vis enfin à la hauteur de mon potentiel et c’est incroyable.',
    'La vie a retrouvé ses couleurs, et je suis enthousiaste pour l’avenir.',
    'Je suis plus présent et engagé dans les conversations.',
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>
        Pourquoi des milliers décident d’arrêter
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {quotes.map((quote) => (
          <blockquote
            key={quote}
            style={{
              margin: 0,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #e7e7e7',
              background: '#fafafa',
              fontStyle: 'italic',
            }}
          >
            {quote}
          </blockquote>
        ))}
      </div>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Vous n’êtes pas seul dans ce combat. Des milliers de personnes
        reprennent le contrôle de leur vie chaque jour.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomRewiringAdvantages({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>
        SOBRE vous aide à arrêter 76% plus rapidement que la seule volonté.
      </h1>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

const goals = [
  'Arrêter complètement',
  'Améliorer mes relations',
  'Retrouver de l’énergie / de la motivation',
  'Améliorer ma clarté mentale',
  'Être plus présent dans mes interactions',
  'Réduire l’anxiété / retrouver la paix intérieure',
  'Booster mon estime de moi',
  'Être plus concentré au travail / dans mes études',
  'Me reconnecter à mes valeurs',
];

export function CustomPersonalGoalsMultiSelect({
  step,
  answers,
  setAnswers,
  goNext,
}: CustomProps) {
  const [selected, setSelected] = useState<string[]>(
    String(answers.personal_goals ?? '')
      .split('||')
      .filter(Boolean)
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Définissons tes objectifs</h1>
      <p style={{ marginBottom: 16, color: '#444' }}>
        Sélectionne tout ce qui s’applique.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {goals.map((goal) => {
          const active = selected.includes(goal);
          return (
            <button
              key={goal}
              onClick={() => {
                setSelected((prev) =>
                  prev.includes(goal)
                    ? prev.filter((value) => value !== goal)
                    : [...prev, goal]
                );
              }}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                borderRadius: 10,
                border: `1px solid ${active ? '#111' : '#ddd'}`,
                background: active ? '#f3f3f3' : '#fff',
                cursor: 'pointer',
              }}
            >
              {goal}
            </button>
          );
        })}
      </div>
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
            personal_goals: selected.join('||'),
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

export function CustomCommitmentSignatureCanvas({
  step,
  answers,
  setAnswers,
  goNext,
}: CustomProps) {
  const [signature, setSignature] = useState(String(answers.signature ?? ''));

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Signe ton engagement</h1>
      <p style={{ marginBottom: 8, color: '#444' }}>
        Fais une promesse à toi-même : arrêter la pornographie.
      </p>
      <p style={{ marginBottom: 8 }}>Dessinez votre signature ici</p>
      <div
        style={{
          marginBottom: 8,
          minHeight: 120,
          borderRadius: 12,
          border: '2px dashed #cfcfcf',
          background: '#fafafa',
        }}
      />
      <p style={{ marginBottom: 12, color: '#444' }}>
        Dessinez dans l’espace ouvert ci-dessus
      </p>
      <input
        type="text"
        value={signature}
        onChange={(event) => setSignature(event.currentTarget.value)}
        placeholder="Signature (optionnel)"
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 12,
          border: '1px solid #ddd',
          marginBottom: 16,
        }}
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
          setAnswers((prev) => ({ ...prev, signature }));
          goNext();
        }}
        disabled={!step.nav?.next}
      >
        Continuer
      </button>
    </div>
  );
}

export function CustomRateUsSocialProof({ step, goNext }: CustomProps) {
  const reviews = [
    'Le blocage des sites a stoppé mon plus gros déclencheur.',
    '90 jours clean grâce aux streaks et au soutien de la communauté.',
    'Je reprends le contrôle. C’est simple et ça m’aide vraiment.',
    'J’ai enfin de la clarté mentale et je suis plus motivé.',
    'Le diagnostic m’a fait un déclic. Je sais quoi faire maintenant.',
    'Les rappels et le suivi m’aident à rester constant.',
    'Je suis plus présent avec ma copine. Merci SOBRE.',
    'Je craque beaucoup moins. Je me sens enfin en contrôle.',
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8, whiteSpace: 'pre-line' }}>
        {`Aide-nous à vaincre le\nporno`}
      </h1>
      <p style={{ marginBottom: 12, color: '#444', lineHeight: 1.45 }}>
        Chaque note nous aide à lutter contre l’industrie du porno et à aider
        plus de personnes.
      </p>
      <p style={{ marginBottom: 4, fontWeight: 600 }}>Plus de 300 avis 5 étoiles</p>
      <p style={{ marginBottom: 12, fontWeight: 600 }}>5k+ utilisateurs SOBRE</p>
      <div
        style={{
          border: '1px solid #e7e7e7',
          borderRadius: 12,
          padding: 10,
          marginBottom: 16,
          maxHeight: 190,
          overflowY: 'auto',
          background: '#fafafa',
        }}
      >
        {reviews.map((review) => (
          <p key={review} style={{ margin: '0 0 8px 0' }}>
            “{review}”
          </p>
        ))}
      </div>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomFreeTrialPitch({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>🎁 Essai gratuit</h1>
      <p style={{ marginBottom: 10, whiteSpace: 'pre-line' }}>
        {`SOBRE est gratuit\nà essayer pour toi.`}
      </p>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.45 }}>
        On dépend du soutien de personnes comme toi pour continuer à développer
        un outil qui aide à arrêter la pornographie et à reprendre le contrôle.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomReferralCodeInput({
  step,
  answers,
  setAnswers,
  goNext,
}: CustomProps) {
  const [referralCode, setReferralCode] = useState(
    String(answers.referral_code ?? '')
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>
        Avez-vous un code de parrainage ?
      </h1>
      <p style={{ marginBottom: 16, color: '#444' }}>
        Vous pouvez passer cette étape.
      </p>
      <input
        type="text"
        value={referralCode}
        onChange={(event) => setReferralCode(event.currentTarget.value)}
        placeholder="Code (optionnel)"
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 12,
          border: '1px solid #ddd',
          marginBottom: 16,
        }}
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
          setAnswers((prev) => ({ ...prev, referral_code: referralCode.trim() }));
          goNext();
        }}
        disabled={!step.nav?.next}
      >
        Continuer
      </button>
    </div>
  );
}

export function CustomPersonalizedSummaryPlan({
  step,
  answers,
  goNext,
}: CustomProps) {
  const userName = String(answers.firstName ?? answers.first_name ?? '').trim();
  const sobrietyDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, []);

  const roadmap = [
    [
      'Jour 0 — Préparer ton espace',
      'Optimise ton environnement (physique & digital) pour rendre le changement plus simple.',
    ],
    [
      'Jour 1 — Déjouer le sevrage',
      'Utilise des outils mentaux et physiques pour traverser les envies et te recentrer.',
    ],
    [
      'Jour 2 — Battre le jeu des envies',
      'Repère tes déclencheurs et remplace-les par des habitudes plus saines et gratifiantes.',
    ],
    [
      '🧠 Dès le jour 2, ton cerveau commence à se réinitialiser.',
      'La dopamine commence à se stabiliser. Les envies peuvent monter au début — mais c’est un signe clair que la guérison a commencé.',
    ],
    [
      'Jour 3 — Renforcer ton “pourquoi”',
      'Transforme tes raisons profondes en motivation quotidienne et en focus.',
    ],
    [
      'Jour 4 — Écraser les symptômes',
      'Apprends à gérer la fatigue, le stress ou l’irritabilité avec des “resets” simples.',
    ],
    [
      '🧠 Ton focus revient vite.',
      'Le brouillard mental commence à se lever et la motivation revient. Sommeil, énergie et clarté sont juste au coin de la rue.',
    ],
    [
      'Jour 5 — Se sentir mieux dans son corps',
      'Bouge, mange mieux et recharge : ton énergie et ta clarté peuvent revenir rapidement.',
    ],
    [
      'Jour 6 — Tu n’es pas seul',
      'Connecte-toi à d’autres sur le même chemin. Partage tes victoires et reçois du soutien.',
    ],
    [
      'Jour 7 — Reprendre ton temps',
      'Remplace les anciennes habitudes par de vrais objectifs et des actions qui comptent.',
    ],
    [
      '📊 Fin de la semaine 1 — stats & élan',
      'Les envies sont encore là, mais plus faciles à gérer. Énergie, confiance et motivation se renforcent : c’est ton premier vrai goût de liberté.',
    ],
  ] as const;

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>
        {userName || 'Toi'}, voici ton plan personnalisé.
      </h1>
      <p style={{ marginBottom: 4 }}>Tu seras sobre à partir du :</p>
      <p style={{ marginBottom: 12, fontWeight: 700 }}>{sobrietyDate}</p>
      <p style={{ marginBottom: 6, fontWeight: 700 }}>
        Ce n’est pas une question de volonté.
      </p>
      <p style={{ marginBottom: 6, fontWeight: 700 }}>
        C’est un système qui fonctionne vraiment.
      </p>
      <p style={{ marginBottom: 10, color: '#444', lineHeight: 1.45 }}>
        SOBRE te guide à travers un reset puissant, avec une structure et des
        outils qui t’aident à progresser, même quand c’est difficile.
      </p>
      <p style={{ marginBottom: 10, fontWeight: 600 }}>
        Voici à quoi ressemblent tes 7 premiers jours :
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {roadmap.map(([title, text]) => (
          <div
            key={title}
            style={{
              border: '1px solid #e7e7e7',
              borderRadius: 10,
              padding: 10,
              background: '#fafafa',
            }}
          >
            <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>{title}</p>
            <p style={{ margin: 0, color: '#444', lineHeight: 1.4 }}>{text}</p>
          </div>
        ))}
      </div>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomTrialReminderPaywallGate({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 10, whiteSpace: 'pre-line' }}>
        {`On t’enverra un rappel\navant la fin de ton essai gratuit`}
      </h1>
      <p style={{ marginBottom: 24, color: '#444' }}>Aucun paiement maintenant</p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}
