export default function Pricing() {
  const canceled = new URLSearchParams(window.location.search).get("canceled");
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold">Tarifs</h1>
        {canceled ? (
          <p className="mt-2 text-white/70">Paiement annulé. Tu peux réessayer quand tu veux.</p>
        ) : (
          <p className="mt-2 text-white/70">Choisis ton plan depuis l’onboarding.</p>
        )}
        <div className="mt-8">
          <a
            href="/start-first5"
            className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 text-base font-semibold text-black hover:bg-yellow-300 transition-colors"
          >
            Revenir à l’onboarding
          </a>
        </div>
      </div>
    </div>
  );
}

