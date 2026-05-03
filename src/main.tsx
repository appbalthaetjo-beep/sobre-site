import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PostHogProvider } from '@posthog/react';
import App from './App.tsx';
import OnboardingFirst5 from './onboarding/OnboardingFirst5.tsx';
import { OnboardingPage } from './onboarding/OnboardingPage.tsx';
import Success from './pages/Success.tsx';
import Pricing from './pages/Pricing.tsx';
import { TRIAL_REMINDER_PATH } from './lib/funnelIdentity';
import { trackMetaPageView } from './lib/metaPixel';
import { getPostHogConfig, markPostHogReady } from './lib/posthog';
import './index.css';

const LOCATION_CHANGE_EVENT = 'sobre:locationchange';

type LocationSnapshot = {
  hash: string;
  pathname: string;
  search: string;
};

let historyPatched = false;

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

function getLocationSnapshot(): LocationSnapshot {
  return {
    hash: window.location.hash,
    pathname: normalizePathname(window.location.pathname),
    search: window.location.search,
  };
}

function patchHistoryMethods() {
  if (historyPatched || typeof window === 'undefined') return;

  const notifyLocationChange = () => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  };

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = function pushState(...args) {
    const result = originalPushState(...args);
    notifyLocationChange();
    return result;
  };

  window.history.replaceState = function replaceState(...args) {
    const result = originalReplaceState(...args);
    notifyLocationChange();
    return result;
  };

  historyPatched = true;
}

function useBrowserLocation() {
  const [location, setLocation] = useState<LocationSnapshot>(() => getLocationSnapshot());

  useEffect(() => {
    patchHistoryMethods();

    const updateLocation = () => {
      setLocation(getLocationSnapshot());
    };

    window.addEventListener('popstate', updateLocation);
    window.addEventListener(LOCATION_CHANGE_EVENT, updateLocation);

    return () => {
      window.removeEventListener('popstate', updateLocation);
      window.removeEventListener(LOCATION_CHANGE_EVENT, updateLocation);
    };
  }, []);

  return location;
}

function getRedirectUrl(pathname: string, search: string) {
  const params = new URLSearchParams(search);

  if (pathname === '/start' && !params.get('step')) {
    params.set('step', 'index');
    return `/start?${params.toString()}`;
  }

  if (pathname === TRIAL_REMINDER_PATH && !params.get('step')) {
    params.set('step', 'trial-reminder');
    return `${TRIAL_REMINDER_PATH}?${params.toString()}`;
  }

  return '';
}

const NullRoute = () => null;
function getRootComponent(pathname: string, redirectUrl: string) {
  if (redirectUrl) return NullRoute;
  if (pathname === '/start') return OnboardingFirst5;
  if (pathname === TRIAL_REMINDER_PATH) return OnboardingFirst5;
  if (pathname === '/onboarding') return OnboardingPage;
  if (pathname === '/success') return Success;
  if (pathname === '/pricing') return Pricing;
  return App;
}

function AppShell() {
  const location = useBrowserLocation();
  const redirectUrl = getRedirectUrl(location.pathname, location.search);
  const RootComponent = getRootComponent(location.pathname, redirectUrl);

  useEffect(() => {
    if (redirectUrl) {
      const currentUrl = `${location.pathname}${location.search}${location.hash}`;
      if (currentUrl !== redirectUrl) {
        window.location.replace(redirectUrl);
      }
      return;
    }

    trackMetaPageView(location.pathname, location.search);
  }, [location.hash, location.pathname, location.search, redirectUrl]);

  return <RootComponent />;
}

const posthogConfig = getPostHogConfig();
const app = (
  <StrictMode>
    <AppShell />
  </StrictMode>
);

createRoot(document.getElementById('root')!).render(
  posthogConfig.key && posthogConfig.host ? (
    <StrictMode>
      <PostHogProvider
        apiKey={posthogConfig.key}
        options={{
          api_host: posthogConfig.host,
          autocapture: true,
          capture_pageview: 'history_change',
          loaded: () => markPostHogReady(),
        }}
      >
        <AppShell />
      </PostHogProvider>
    </StrictMode>
  ) : (
    app
  )
);
