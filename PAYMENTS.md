# Paiements (Web)

Ce repo supporte:
- Stripe Checkout (abonnements): carte + Apple Pay (si active sur Stripe et domaine verifie)

## Variables d'environnement

Front (Vite): voir `.env.example`.

Server: voir `server/.env.example`.

## Lancer en local

1. Server:

```bash
cd server
cp .env.example .env
node index.js
```

2. Front:

```bash
cp .env.example .env
npm run dev
```

Ouvrir: `http://localhost:5173/start-first5`

## Notes Apple Pay

Apple Pay sur le web requiert un domaine HTTPS verifie chez Stripe (localhost ne suffit pas).
