export default function Pricing() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Tarifs</h2>
        <p className="text-gray-400 mb-10">
          DÃ©bloque lâ€™accÃ¨s Premium et accÃ©lÃ¨re ta progression.
        </p>

        <div className="bg-zinc-900 border border-gray-800 rounded-2xl p-8 max-w-md mx-auto">
          <div className="text-4xl font-bold mb-2">9,99â‚¬</div>
          <div className="text-gray-400 mb-6">par mois</div>

          <ul className="text-left space-y-3 mb-8">
            <li>âœ… AccÃ¨s complet</li>
            <li>âœ… Suivi quotidien</li>
            <li>âœ… Statistiques & objectifs</li>
          </ul>

          <button className="w-full rounded-xl bg-yellow-400 text-black font-semibold py-3">
            Continuer (bientÃ´t Apple Pay)
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Paiement sÃ©curisÃ©. Annulable Ã  tout moment.
          </p>
        </div>
      </div>
    </section>
  );
}

