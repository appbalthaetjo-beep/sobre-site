import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import OnboardingFirst5 from './onboarding/OnboardingFirst5.tsx';
import { OnboardingPage } from './onboarding/OnboardingPage.tsx';
import Success from './pages/Success.tsx';
import Pricing from './pages/Pricing.tsx';
import './index.css';

const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
const RootComponent =
  pathname === '/' || pathname === '/start-first5'
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
