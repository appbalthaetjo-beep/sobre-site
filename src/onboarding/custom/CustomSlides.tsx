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

export function CustomSlide3RelationshipChat({ step, goNext }: CustomProps) {
  const script = [
    'POURQUOI PORNHUB EST DANS TON HISTORIQUE ?!?',
    'TU ME TROMPES ?!?!',
    'JE NE SUIS PAS ASSEZ BIEN POUR TOI ?',
    'BÉBÉ, CE N’EST PAS CE QUE TU CROIS…',
    'C’EST FINI. VA TE METTRE EN COUPLE AVEC UNE PORNSTAR.',
  ];

  return (
    <div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          background: '#fafafa',
        }}
      >
        {script.map((line) => (
          <p key={line} style={{ margin: '0 0 8px 0', lineHeight: 1.35 }}>
            {line}
          </p>
        ))}
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>
        Le porno détruit les relations.
      </h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Regarder du porno peut entraîner des difficultés d’érection, une baisse
        de libido et une perte d’attirance envers les autres.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide1({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>La pornographie est une drogue</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        L’utilisation de pornographie libère un produit chimique dans le cerveau
        appelé dopamine. Ce produit chimique vous fait vous sentir bien – c’est
        pourquoi vous ressentez du plaisir lorsque vous regardez de la
        pornographie.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide2({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>La pornographie brise le désir</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Plus de 50 % des personnes dépendantes au porno ont signalé une perte
        d’intérêt pour le vrai sexe.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide4({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Chemin vers le rétablissement</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Le rétablissement est possible. En t’abstenant de pornographie, ton
        cerveau peut réinitialiser sa sensibilité à la dopamine, conduisant à
        des relations plus saines et un bien-être amélioré.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide6({ step, goNext }: CustomProps) {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Bienvenue sur SOBRE</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Libérez-vous de la pornographie et reprenez le contrôle de votre vie.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide7({ step, goNext }: CustomProps) {
  return (
    <div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          background: '#fafafa',
        }}
      >
        <p style={{ margin: '0 0 6px 0' }}>LIVE</p>
        <p style={{ margin: '0 0 6px 0' }}>Presque au bout !</p>
        <p style={{ margin: '0 0 6px 0' }}>
          Aujourd’hui ça fait 75 jours sans porno… je sens déjà la différence.
        </p>
        <p style={{ margin: '0 0 6px 0' }}>Jacob</p>
        <p style={{ margin: '0 0 6px 0' }}>0 jours</p>
        <p style={{ margin: '0 0 6px 0' }}>il y a 1 jour</p>
        <p style={{ margin: '0 0 6px 0' }}>Jake</p>
        <p style={{ margin: 0 }}>En train d’écrire</p>
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Réussissons ensemble</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Vous n’êtes pas seul. Rejoignez une communauté grandissante de plus de
        10 000 membres sur le même chemin, qui se soutiennent et se motivent à
        chaque étape.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide8({ step, goNext }: CustomProps) {
  return (
    <div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          background: '#fafafa',
        }}
      >
        <p style={{ margin: '0 0 6px 0' }}>Analyse…</p>
        <p style={{ margin: '0 0 6px 0' }}>Sites bloqués</p>
        <p style={{ margin: '0 0 6px 0' }}>XVideos.com</p>
        <p style={{ margin: '0 0 6px 0' }}>Pornhub.com</p>
        <p style={{ margin: '0 0 6px 0' }}>Blocage…</p>
        <p style={{ margin: 0 }}>Bloqué</p>
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Bloquez vos tentations</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Restez protégé grâce à un blocage privé qui élimine les tentations et
        casse le cycle.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide9({ step, goNext }: CustomProps) {
  return (
    <div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          background: '#fafafa',
        }}
      >
        <p style={{ margin: '0 0 6px 0' }}>5 min</p>
        <p style={{ margin: '0 0 6px 0' }}>+ Ajouter des apps</p>
        <p style={{ margin: 0 }}>Démarrer le blocage</p>
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Limitez vos déclencheurs</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Réduisez vos tentations en limitant le temps d’écran sur les
        applications qui vous déclenchent.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide10({ step, goNext }: CustomProps) {
  return (
    <div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          background: '#fafafa',
        }}
      >
        <p style={{ margin: '0 0 6px 0' }}>Il se fait tard…</p>
        <p style={{ margin: '0 0 6px 0' }}>Maintenant</p>
        <p style={{ margin: 0 }}>
          Pense à noter tes symptômes pour garder le cap.
        </p>
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Reste sur la bonne voie</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Reste régulier grâce aux rappels, au suivi des séries et aux
        notifications motivantes — conçus pour te garder responsable et avancer.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}

export function CustomSlide11({ step, goNext }: CustomProps) {
  return (
    <div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          background: '#fafafa',
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>
          Hey, je prends des nouvelles. Ces derniers jours ont été intenses…
          comment tu te sens ?
        </p>
        <p style={{ margin: 0 }}>
          Honnêtement… je me perds dans le scroll et je replonge dès que ça
          devient difficile.
        </p>
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Support personnalisé</h1>
      <p style={{ marginBottom: 24, color: '#444', lineHeight: 1.5 }}>
        Ton assistant IA t’aide au quotidien avec des check-ins, des rappels et
        des conseils adaptés — pour avancer, même quand c’est dur.
      </p>
      <ContinueButton step={step} goNext={goNext} />
    </div>
  );
}
