type PostHogProperties = Record<string, string | number | boolean | null | undefined>;

type PostHogClientLike = {
  capture: (eventName: string, properties?: PostHogProperties) => void;
} | null | undefined;

type PendingCheckoutPayload = {
  currency: "EUR";
  offerName: string;
  planType: "month" | "year";
  price: number;
};

declare global {
  interface Window {
    __sobrePostHogState?: {
      firedKeys: Record<string, boolean>;
      pendingOnce: PendingOnceCapture[];
      pendingOnceKeys: Record<string, boolean>;
      ready: boolean;
    };
  }
}

type PendingOnceCapture = {
  eventKey: string;
  eventName: string;
  properties?: PostHogProperties;
  posthog: PostHogClientLike;
};

const PENDING_CHECKOUT_STORAGE_KEY = "sobre_posthog_pending_checkout";

function getPostHogState() {
  if (!window.__sobrePostHogState) {
    window.__sobrePostHogState = {
      firedKeys: {},
      pendingOnce: [],
      pendingOnceKeys: {},
      ready: false,
    };
  }

  return window.__sobrePostHogState;
}

function hasCaptured(eventKey: string) {
  return !!getPostHogState().firedKeys[eventKey];
}

function markCaptured(eventKey: string) {
  getPostHogState().firedKeys[eventKey] = true;
}

function enqueueOnceCapture(payload: PendingOnceCapture) {
  const state = getPostHogState();
  if (state.pendingOnceKeys[payload.eventKey]) return;
  state.pendingOnceKeys[payload.eventKey] = true;
  state.pendingOnce.push(payload);
}

function flushPendingOnce() {
  const state = getPostHogState();
  if (!state.ready || state.pendingOnce.length === 0) return;

  const pending = state.pendingOnce;
  state.pendingOnce = [];
  state.pendingOnceKeys = {};

  pending.forEach(({ eventKey, eventName, properties, posthog }) => {
    if (!posthog || hasCaptured(eventKey)) return;
    posthog.capture(eventName, properties);
    markCaptured(eventKey);
  });
}

export function markPostHogReady() {
  const state = getPostHogState();
  if (state.ready) return;
  state.ready = true;
  flushPendingOnce();
}

export function getPostHogConfig() {
  return {
    host: String(import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "").trim(),
    key: String(import.meta.env.VITE_PUBLIC_POSTHOG_KEY || "").trim(),
  };
}

export function capturePostHogEvent(
  posthog: PostHogClientLike,
  eventName: string,
  properties?: PostHogProperties
) {
  if (!posthog) return;
  posthog.capture(eventName, properties);
}

export function capturePostHogEventOnce(
  posthog: PostHogClientLike,
  eventKey: string,
  eventName: string,
  properties?: PostHogProperties
) {
  if (!posthog || hasCaptured(eventKey)) return;

  const state = getPostHogState();
  if (!state.ready) {
    enqueueOnceCapture({ eventKey, eventName, properties, posthog });
    return;
  }

  posthog.capture(eventName, properties);
  markCaptured(eventKey);
}

export function savePendingCheckout(payload: PendingCheckoutPayload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingCheckout() {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingCheckoutPayload;
    if (
      parsed?.currency !== "EUR" ||
      typeof parsed?.offerName !== "string" ||
      (parsed?.planType !== "month" && parsed?.planType !== "year") ||
      typeof parsed?.price !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
}
