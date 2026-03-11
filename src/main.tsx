import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import OnboardingFirst5 from './onboarding/OnboardingFirst5.tsx';
import { OnboardingPage } from './onboarding/OnboardingPage.tsx';
import Success from './pages/Success.tsx';
import Pricing from './pages/Pricing.tsx';
import { buildTrialReminderUrl, TRIAL_REMINDER_PATH } from './lib/funnelIdentity';
import './index.css';

const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const search = window.location.search;
const params = new URLSearchParams(search);
const canonicalTrialReminderUrl = buildTrialReminderUrl(search);

let redirectUrl = '';
if (pathname === '/' || pathname === '/pricing') {
  redirectUrl = canonicalTrialReminderUrl;
} else if (pathname === TRIAL_REMINDER_PATH && !params.get('step')) {
  redirectUrl = canonicalTrialReminderUrl;
}

if (redirectUrl) {
  const currentUrl = `${pathname}${search}${window.location.hash}`;
  if (currentUrl !== redirectUrl) {
    window.location.replace(redirectUrl);
  }
}

const NullRoute = () => null;
const RootComponent =
  redirectUrl
    ? NullRoute
    : pathname === TRIAL_REMINDER_PATH
    ? OnboardingFirst5
    : pathname === '/start'
      ? OnboardingPage
      : pathname === '/success'
        ? Success
        : pathname === '/pricing'
          ? Pricing
      : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>
);
