import React, { useEffect, useRef, useState } from 'react';
import { Brain, Target, Users, Zap, Shield, Trophy, CheckCircle } from 'lucide-react';

const rewardsMilestones = [
  { src: 'https://i.imgur.com/I0CDkDl.png', title: 'Palier 1' },
  { src: 'https://i.imgur.com/cniGCsd.png', title: 'Palier 2' },
  { src: 'https://i.imgur.com/LNMqJ98.png', title: 'Palier 3' },
  { src: 'https://i.imgur.com/MKLuVcH.png', title: 'Palier 4' },
  { src: 'https://i.imgur.com/Vl6qAgW.png', title: 'Palier 5' },
  { src: 'https://i.imgur.com/MY22kz8.png', title: 'Palier 6' },
  { src: 'https://i.imgur.com/umTTlbn.png', title: 'Palier 7' },
  { src: 'https://i.imgur.com/nDgOpzY.png', title: 'Palier 8' },
  { src: 'https://i.imgur.com/GeKdi4a.png', title: 'Palier 9' },
  { src: 'https://i.imgur.com/hPEjBe0.png', title: 'Palier 10' },
] as const;

function App() {
  const targetCount = 5000;
  const [trustedCount, setTrustedCount] = useState(0);
  const rewardsCarouselRef = useRef<HTMLDivElement | null>(null);
  const [activePage, setActivePage] = useState<'home' | 'support'>('home');

  useEffect(() => {
    const duration = 1200;
    const pause = 800;
    let startTime: number | null = null;
    let frameId = 0;
    let timeoutId = 0;

    const animate = () => {
      startTime = null;
      setTrustedCount(0);

      const step = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp;
        }
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setTrustedCount(Math.round(progress * targetCount));
        if (progress < 1) {
          frameId = window.requestAnimationFrame(step);
          return;
        }
        timeoutId = window.setTimeout(animate, pause);
      };

      frameId = window.requestAnimationFrame(step);
    };

    animate();
    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const carousel = rewardsCarouselRef.current;
    if (!carousel) {
      return;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduceMotion?.matches) {
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();
    let initialized = false;
    const speedPxPerSec = 28;

    const tick = (time: number) => {
      const half = carousel.scrollWidth / 2;

      if (!initialized && half > 0) {
        carousel.scrollLeft = half;
        initialized = true;
      }

      const deltaMs = time - lastTime;
      lastTime = time;

      if (half > 0) {
        carousel.scrollLeft -= (speedPxPerSec * deltaMs) / 1000;
        if (carousel.scrollLeft <= 0) {
          carousel.scrollLeft += half;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const trustedDisplay = trustedCount >= targetCount ? '5000+' : trustedCount.toString();
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-6 pt-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-full border border-white/10 bg-black/70 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
              }}
              className="inline-flex items-center"
              aria-label="Accueil"
            >
              <img src="https://i.imgur.com/Gq0mmt7.png" alt="Sobre" className="h-8 w-auto object-contain" />
            </button>

            <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
              <button
                type="button"
                onClick={() => {
                  setActivePage('home');
                  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                }}
                className="hover:text-white transition-colors"
              >
                Accueil
              </button>
              <a className="hover:text-white transition-colors" href="#blog">Blog</a>
              <a className="hover:text-white transition-colors" href="#features">Features</a>
              <button
                type="button"
                onClick={() => {
                  setActivePage('support');
                  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                }}
                className="hover:text-white transition-colors"
              >
                Support
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setActivePage('support');
                  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                }}
                className="md:hidden inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors min-h-[44px]"
              >
                Support
              </button>
              <a
                href="https://apps.apple.com/fr/app/sobre-arr%C3%AAte-le-porno/id6751785162"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white text-black px-3 sm:px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 whitespace-nowrap min-h-[44px]"
              >
                <span className="sm:hidden">Essayer</span>
                <span className="hidden sm:inline">Essayer gratuitement</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {activePage === 'support' ? (
        <main className="pt-28 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent p-8 sm:p-10">
              <span className="inline-flex items-center rounded-full border border-yellow-300/30 bg-yellow-400/10 px-4 py-1 text-xs uppercase tracking-widest text-yellow-100">
                Support
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
                Support — <span className="text-yellow-300">SOBRE</span>
              </h1>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Bienvenue sur la page d’assistance de <strong className="text-white">SOBRE</strong>, l’app qui t’aide à{' '}
                <strong className="text-white">réduire puis arrêter la pornographie</strong> avec un programme structuré, un plan d’urgence (SOS)
                et un chatbot 24/7 (Clario).
              </p>
              <p className="mt-3 text-gray-300 leading-relaxed">
                Notre équipe est là pour t’aider sur l’utilisation, les achats et la gestion de tes données.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:sobre.appli@gmail.com?subject=Support%20SOBRE"
                  className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 text-base font-semibold text-black shadow-[0_0_40px_rgba(255,214,0,0.18)] hover:bg-yellow-300 transition-colors"
                >
                  Contact us
                </a>
                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Retour au site
                </button>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <section className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8">
                <h2 className="text-2xl font-semibold">Nous contacter</h2>
                <div className="mt-4 grid gap-3 text-gray-300">
                  <p>
                    <span className="text-white font-semibold">Email :</span> <span className="text-white font-semibold">sobre.appli@gmail.com</span>
                  </p>
                  <p>
                    <span className="text-white font-semibold">Responsable :</span> Équipe <span className="text-white font-semibold">SØBRE</span>
                  </p>
                  <p>
                    <span className="text-white font-semibold">Délai de réponse :</span> sous <span className="text-white font-semibold">48 h</span>{' '}
                    ouvrées (FR/EN)
                  </p>
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-gray-300">
                    <p className="text-white/90 font-semibold mb-2">Pour aller plus vite :</p>
                    <p>
                      Merci d’indiquer : ton pays, ton modèle d’iPhone, la version iOS, la version de l’app (Profil → À propos), et une capture si possible.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8">
                <h2 className="text-2xl font-semibold">Urgences & bien-être</h2>
                <div className="mt-4 space-y-3 text-gray-300 leading-relaxed">
                  <p>
                    SOBRE est un <span className="text-white font-semibold">outil de bien-être</span>. L’app{' '}
                    <span className="text-white font-semibold">ne remplace pas</span> un avis médical, un diagnostic ou un traitement.
                  </p>
                  <p>
                    En cas de <span className="text-white font-semibold">détresse</span> ou d’<span className="text-white font-semibold">urgence</span>, contacte immédiatement
                    les <span className="text-white font-semibold">services d’urgence</span> de ton pays (112/911) ou une ligne d’écoute locale.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8">
                <h2 className="text-2xl font-semibold">Achats, abonnements et facturation (iOS)</h2>
                <div className="mt-6 space-y-6 text-gray-300 leading-relaxed">
                  <div>
                    <h3 className="text-lg font-semibold text-white">S’abonner</h3>
                    <p className="mt-2">
                      SOBRE propose un <span className="text-white font-semibold">abonnement Premium mensuel ou annuel</span>. Certains utilisateurs éligibles voient une{' '}
                      <span className="text-white font-semibold">offre d’introduction</span> (essai/prix réduit) présentée par Apple.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Gérer ou annuler son abonnement</h3>
                    <ol className="mt-2 list-decimal pl-6 space-y-2">
                      <li>Ouvre Réglages sur ton iPhone</li>
                      <li>Appuie sur ton Apple ID → Abonnements</li>
                      <li>Sélectionne SOBRE → choisis Annuler ou modifier l’offre</li>
                    </ol>
                    <p className="mt-2 text-sm text-gray-300">
                      Les abonnements sont gérés par Apple. Les remboursements sont traités via{' '}
                      <a
                        href="https://reportaproblem.apple.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 underline underline-offset-4 break-all"
                      >
                        reportaproblem.apple.com
                      </a>
                      .
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Restaurer ses achats</h3>
                    <p className="mt-2">
                      Si tu réinstalles l’app ou changes d’appareil :{' '}
                      <span className="text-white font-semibold">Ouvre SOBRE → Profil/Paramètres → “Restaurer les achats”</span>.
                    </p>
                    <p className="mt-2">Assure-toi d’utiliser le même Apple ID que celui de l’achat.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8">
                <h2 className="text-2xl font-semibold">Compte, données et confidentialité</h2>
                <div className="mt-6 space-y-6 text-gray-300 leading-relaxed">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Supprimer son compte et ses données</h3>
                    <ul className="mt-2 list-disc pl-6 space-y-2">
                      <li>
                        Dans l’app : <span className="text-white font-semibold">Profil/Paramètres → Supprimer mon compte</span> (suppression définitive de tes données actives après délai légal/technique).
                      </li>
                      <li>
                        Ou par email : écris à <span className="text-white font-semibold">sobre.appli@gmail.com</span> avec l’objet{' '}
                        <span className="text-white font-semibold">“Suppression de compte – SOBRE”</span> en indiquant :
                        <ul className="mt-2 list-disc pl-6 space-y-1">
                          <li>Ton Apple ID (adresse mail)</li>
                          <li>La date approximative du premier achat/inscription</li>
                          <li>(Facultatif) L’App User ID affiché dans Profil → À propos</li>
                        </ul>
                      </li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-300">
                      Nous confirmerons la suppression sous 30 jours maximum (souvent beaucoup plus rapide).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">Droits RGPD/équivalents</h3>
                    <p className="mt-2">
                      Tu peux demander accès, rectification, portabilité ou suppression de tes données via{' '}
                      <span className="text-white font-semibold">sobre.appli@gmail.com</span>.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">Confidentialité</h3>
                    <ul className="mt-2 list-disc pl-6 space-y-2">
                      <li>SOBRE n’affiche aucun contenu explicite.</li>
                      <li>Les données d’abonnement sont gérées de manière sécurisée via l’App Store (Apple).</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8">
                <h2 className="text-2xl font-semibold">Dépannage rapide</h2>
                <div className="mt-6 space-y-5 text-gray-300 leading-relaxed">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Clario (chatbot) ne répond pas ?</h3>
                    <p className="mt-2">
                      Vérifie ta connexion. Ferme/réouvre l’app. Assure-toi d’avoir la dernière version dans l’App Store.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Le paywall ne s’affiche pas / offre d’intro absente ?</h3>
                    <p className="mt-2">
                      Les offres d’introduction sont proposées par Apple selon l’éligibilité du compte. Si tu as déjà été abonné,
                      l’offre peut ne plus apparaître.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Impossible de restaurer l’abonnement ?</h3>
                    <p className="mt-2">
                      Déconnecte/reconnecte ton Apple ID, redémarre l’appareil, puis Profil → Restaurer les achats.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">L’app plante ou rame ?</h3>
                    <p className="mt-2">
                      Redémarre l’iPhone, libère de l’espace, vérifie la mise à jour de l’app. Si ça persiste, écris-nous (avec capture/logs si possible).
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      ) : (
      <>
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-black to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.08),transparent_55%)]"></div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-gray-300">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                Trusted by {trustedDisplay} users
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
                Reprends le contrôle avec Sobre.
              </h1>
              <p className="mt-5 text-lg text-gray-300 max-w-xl">
                Un coach discret, des défis clairs, et une progression visible pour arrêter durablement.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://apps.apple.com/fr/app/sobre-arr%C3%AAte-le-porno/id6751785162"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Télécharger sur</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </a>

                <a
                  href="https://getwaitlist.com/waitlist/30056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Disponible sur</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <img
                src="https://i.imgur.com/AsW1Dq2.png"
                alt="Aperçu de l'application Sobre"
                className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="text-red-400">❌ Ce que cette addiction</span>
              <br />
              <span className="text-white">te vole chaque jour</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Chaque rechute t'éloigne un peu plus de tes objectifs et de la personne que tu veux devenir.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: "Ta motivation",
                description: "Fatigue mentale chronique, procrastination constante, perte d'intérêt pour tes projets"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Ta confiance",
                description: "Honte profonde, culpabilité écrasante, perte d'estime de soi, repli social"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Tes relations",
                description: "Isolement émotionnel, déconnexion des autres, perte de désir authentique"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Ton cerveau",
                description: "Désensibilisation progressive, besoin de stimulation toujours plus forte"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Ton énergie",
                description: "Baisse de focus, diminution d'ambition, chute de testostérone naturelle"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Ta liberté",
                description: "Illusion de contrôle alors que tu es complètement prisonnier de tes pulsions"
              }
            ].map((item, index) => (
              <div key={index} className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-3xl border border-gray-700/50 hover:border-red-400/30 transition-all duration-300 hover:scale-105">
                <div className="text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {item.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,90,90,0.10),transparent_60%)]"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-gray-900/70 via-black/80 to-black/90 p-12 rounded-3xl border border-red-400/15 shadow-[0_0_60px_rgba(255,80,80,0.08)]">
            <h2 className="text-4xl md:text-5xl font-black mb-8 text-red-300">
              🛑 STOP aux mensonges
            </h2>
            <div className="text-left space-y-6 text-lg leading-relaxed">
              <p className="text-gray-200">
                <strong className="text-white">« C'est juste un moment de détente »</strong> → FAUX.
                C'est une fuite qui t'empêche d'affronter tes défis.
              </p>
              <p className="text-gray-200">
                <strong className="text-white">« C'est naturel et sain »</strong> → FAUX.
                La consommation compulsive de porno dérègle ton système de récompense.
              </p>
              <p className="text-gray-200">
                <strong className="text-white">« Je peux arrêter quand je veux »</strong> → FAUX.
                Si c'était vrai, tu l'aurais déjà fait.
              </p>
            </div>
            <div className="mt-8 p-6 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl">
              <p className="text-yellow-400 font-bold text-xl">
                Il est temps d'arrêter de te mentir et de passer à l'action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,214,0,0.06),transparent_65%)]"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-yellow-200/70">Features</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
              Tout ce qu’il te faut pour arrêter
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Des outils simples et puissants pour tenir dans les moments difficiles, progresser, et rester motivé.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Content Blocker',
                description: 'Bloque les déclencheurs et les sites à risque.',
                icon: <Shield className="h-5 w-5" />,
              },
              {
                title: 'AI Therapist',
                description: 'Un soutien 24/7 pour comprendre tes triggers et rebondir.',
                icon: <Brain className="h-5 w-5" />,
              },
              {
                title: 'Panic Button',
                description: 'Un bouton d’urgence pour casser l’envie en quelques secondes.',
                icon: <Zap className="h-5 w-5" />,
              },
              {
                title: 'Tracker',
                description: 'Suivi de ta sobriété, de tes habitudes et de tes progrès.',
                icon: <Target className="h-5 w-5" />,
              },
              {
                title: 'Personalized Plan',
                description: 'Un plan d’action personnalisé selon ton profil.',
                icon: <Trophy className="h-5 w-5" />,
              },
              {
                title: 'Community',
                description: 'Une communauté anonyme pour rester responsable et motivé.',
                icon: <Users className="h-5 w-5" />,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group min-w-0 rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-colors hover:border-yellow-300/30 hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl border border-yellow-300/20 bg-yellow-400/10 text-yellow-200 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Solution Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 mb-6">
              <h2 className="text-4xl md:text-5xl font-black">Voici</h2>
              <img src="https://i.imgur.com/Gq0mmt7.png" alt="Sobre" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              L'application révolutionnaire conçue par des experts pour t'aider à
              <strong className="text-yellow-400"> te libérer définitivement</strong> de l’addiction à la pornographie.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              {[
                {
                  icon: <Trophy className="w-6 h-6" />,
                  title: "Compteur de sobriété intelligent",
                  description: "Visualise tes progrès en temps réel et célèbre chaque victoire"
                },
                {
                  icon: <Target className="w-6 h-6" />,
                  title: "Défis quotidiens personnalisés",
                  description: "Des missions concrètes pour t'ancrer dans la réalité et construire de nouvelles habitudes"
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Communauté anonyme bienveillante",
                  description: "Connecte-toi avec des hommes qui vivent la même bataille que toi"
                },
                {
                  icon: <Brain className="w-6 h-6" />,
                  title: "Outils neuroscientifiques avancés",
                  description: "Reprogramme ton cerveau avec des techniques validées scientifiquement"
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Contenus exclusifs puissants",
                  description: "Vidéos motivantes, témoignages inspirants, stratégies d'experts"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <div className="text-black">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl border border-yellow-400/20 shadow-2xl shadow-yellow-400/10">
                <div className="text-center mb-6">
                  <img src="https://i.imgur.com/Gq0mmt7.png" alt="Sobre" className="h-16 w-auto object-contain mx-auto mb-4" />
                  <p className="text-gray-300">Ta liberté commence ici</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-semibold">Sobriété actuelle</span>
                      <span className="text-white font-bold">7 jours</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 font-semibold">Défi du jour</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-gray-300 text-sm mt-2">Faire 20 pompes</p>
                  </div>
                  
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-semibold">Communauté</span>
                      <span className="text-white font-bold">2,847 membres</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App Store Buttons */}
          <div className="text-center mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="https://apps.apple.com/fr/app/sobre-arr%C3%AAte-le-porno/id6751785162" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 border border-gray-700/40 rounded-xl p-4 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-400 text-sm">Télécharger sur</p>
                    <p className="text-white font-bold text-lg">App Store</p>
                  </div>
                </div>
              </a>
              
              <a href="https://getwaitlist.com/waitlist/30056" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-400 text-sm">Disponible sur</p>
                    <p className="text-white font-bold text-lg">Google Play</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,214,0,0.10),transparent_60%)]"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full border border-yellow-300/30 bg-yellow-400/10 px-4 py-1 text-xs uppercase tracking-widest text-yellow-100">
              Récompenses
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Débloque des paliers de progression
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Chaque étape symbolise ton avancée. Garde ta série, débloque un nouveau palier.
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent"></div>
            <div
              ref={rewardsCarouselRef}
              className="flex gap-6 overflow-x-auto pb-6 pt-1 -mx-6 px-6 sm:-mx-8 sm:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing touch-pan-x select-none"
            >
            {[...rewardsMilestones, ...rewardsMilestones].map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="group flex-none w-56 rounded-3xl border border-yellow-300/20 bg-gradient-to-br from-yellow-400/10 via-yellow-200/5 to-transparent p-6 text-center shadow-[0_0_30px_rgba(255,214,0,0.08)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mx-auto h-20 w-20 rounded-full border border-yellow-300/30 bg-black/40 p-1">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="h-full w-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900/30 to-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            <span className="text-white">Ils ont repris le</span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">contrôle de leur vie</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alexandre, 28 ans",
                text: "Sobre m'a sauvé. 6 mois de sobriété, ma confiance est revenue, j'ai trouvé l'amour de ma vie.",
                days: "180 jours"
              },
              {
                name: "Maxime, 24 ans", 
                text: "J'ai enfin l'énergie pour mes projets. Ma startup décolle, tout a changé depuis que j'ai arrêté.",
                days: "95 jours"
              },
              {
                name: "Thomas, 31 ans",
                text: "La communauté Sobre est incroyable. Je ne me sens plus seul dans ce combat.",
                days: "240 jours"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-3xl border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-semibold">{testimonial.days}</span>
                </div>
                <p className="text-gray-200 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <p className="text-yellow-400 font-semibold">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,214,0,0.08),transparent_60%)]"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest text-yellow-200/70">Questions fréquentes</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold">Questions fréquentes (FAQ)</h2>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Tout ce que tu dois savoir sur SOBRE, ses fonctionnalités, et comment elle peut t’aider.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent p-4 sm:p-8">
            <div className="space-y-4">
              <details open className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Qu’est-ce que l’app SOBRE ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    SOBRE est une application mobile conçue pour aider à sortir de la consommation compulsive de porno
                    et à reprendre le contrôle. Elle propose un parcours structuré pour progresser jour après jour,
                    avec des outils de suivi, des ressources guidées et du soutien en cas d’envie.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>SOBRE est-elle gratuite ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    SOBRE propose une version gratuite et des fonctionnalités premium via abonnement. Les tarifs exacts
                    et les options sont affichés dans l’app avant tout paiement (mensuel/annuel, selon les offres disponibles).
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Comment accéder à SOBRE ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>SOBRE est disponible sur iOS et Android.</p>
                  <p>Pour la télécharger, recherche “SOBRE” sur l’App Store ou Google Play.</p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Quelles fonctionnalités inclut SOBRE ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>SOBRE regroupe plusieurs outils utiles pour avancer concrètement :</p>
                  <ul className="list-disc pl-5 mt-3 space-y-2">
                    <li>Programme guidé : une progression structurée (objectifs, étapes, conseils).</li>
                    <li>Coach IA (Clario) : soutien rapide et personnalisé quand ça devient difficile.</li>
                    <li>Bouton d’urgence : actions immédiates pour casser l’envie (respiration, reset, focus).</li>
                    <li>Tracker de sobriété : suivi des jours, séries, statistiques et progrès.</li>
                  </ul>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>À quoi sert le bloqueur de contenu ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    Le bloqueur (si activé dans SOBRE) aide à réduire les déclencheurs en limitant l’accès aux contenus
                    à risque (sites, recherches, pages). L’objectif : t’éviter de retomber “en pilote automatique”
                    et te redonner de la marge de contrôle.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>À quoi sert le coach IA (Clario) ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>Clario te soutient dans les moments de pulsion ou de stress. Il t’aide à :</p>
                  <ul className="list-disc pl-5 mt-3 space-y-2">
                    <li>calmer l’envie en temps réel,</li>
                    <li>identifier tes déclencheurs,</li>
                    <li>proposer une réponse simple et actionnable,</li>
                    <li>tenir bon sans culpabilisation.</li>
                  </ul>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>À quoi sert le bouton d’urgence ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    Le bouton d’urgence est fait pour interrompre la boucle. En un clic, il déclenche une séquence
                    courte (respiration / focus / rappel de motivation / action) pour te sortir de l’envie et te remettre
                    dans le contrôle.
                  </p>
                  <p className="mt-3">
                    Conseil : utilise-le pendant les moments HALT (quand tu es Hungry / Angry / Lonely / Tired → faim,
                    colère, solitude, fatigue), car ce sont les moments où la volonté baisse le plus.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>À quoi sert le tracker ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    Le tracker est ton tableau de bord de progression : il suit tes jours, tes séries, tes habitudes
                    et t’aide à visualiser tes progrès. L’objectif : renforcer ta constance et te donner des repères concrets.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Comment fonctionne la gamification dans SOBRE ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    SOBRE transforme la progression en parcours motivant : objectifs, séries, récompenses et étapes
                    débloquées. L’idée : remplacer la récompense immédiate par une motivation durable, et rendre le progrès visible.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Qu’est-ce que le plan personnalisé ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    Le plan personnalisé adapte l’expérience à ton niveau, tes objectifs et tes difficultés. Il se base
                    sur ton onboarding (questions de départ) pour te proposer un parcours plus pertinent et réaliste.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Qu’est-ce que la communauté SOBRE ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    La communauté (si activée dans ta version) est un espace anonyme et sécurisé pour partager, poser des
                    questions, garder l’engagement et se sentir moins seul. Elle sert surtout à l’accountability et au soutien moral.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Est-ce que SOBRE peut aider à “reprogrammer” le système de récompense ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    SOBRE est conçu pour aider ton cerveau à retrouver un équilibre en réduisant les stimulations artificielles
                    et en renforçant les habitudes saines (structure, suivi, outils anti-craving, routines). Avec de la régularité,
                    beaucoup d’utilisateurs ressentent un meilleur contrôle, plus d’énergie et une motivation plus stable.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Est-ce que SOBRE aide avec le “dopamine hijacking” lié au porno ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    SOBRE vise à réduire cette sur-stimulation en te guidant vers des habitudes plus stables : programme progressif,
                    réduction des déclencheurs, outils de gestion d’envie, routines et suivi. L’objectif est de remettre de la distance
                    entre le déclencheur et l’action.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Est-ce que SOBRE aide à remplacer les envies par des activités positives ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    Oui. L’app t’aide à remplacer l’impulsion par une action alternative (respiration, tâches courtes, reset mental,
                    mini-objectifs, contenus guidés). Le but : sortir de la compulsion et construire des réflexes utiles.
                  </p>
                </div>
              </details>

              <details className="group rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
                  <span>Comment SOBRE s’inspire des principes de TCC (CBT) ?</span>
                  <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-yellow-200 transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    SOBRE intègre des principes proches des TCC : identifier les déclencheurs, préparer des réponses, renforcer
                    les habitudes positives et suivre la progression. L’app structure l’effort dans le temps pour rendre le changement
                    plus simple à tenir.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="https://i.imgur.com/Gq0mmt7.png" alt="Sobre" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-gray-400 mb-4">
            Libère-toi de l’addiction à la pornographie. Reprends le contrôle de ta vie.
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 SOBRE. Tous droits réservés. • Fait avec ❤️ pour ta liberté.
          </p>
        </div>
      </footer>
      </>
      )}
    </div>
  );
}

export default App;


