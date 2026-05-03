declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    __sobreMetaPixelState?: {
      initialized: boolean;
      firedKeys: Record<string, boolean>;
    };
  }
}

type MetaTrackParams = Record<string, string | number | boolean | null | undefined>;

type PendingPurchasePayload = {
  currency: "EUR";
  value: number;
};

const META_PIXEL_SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const META_PIXEL_STORAGE_KEY = "sobre_meta_pending_purchase";

function getMetaPixelId() {
  return String(import.meta.env.VITE_META_PIXEL_ID || "").trim();
}

function getMetaPixelState() {
  if (!window.__sobreMetaPixelState) {
    window.__sobreMetaPixelState = {
      initialized: false,
      firedKeys: {},
    };
  }

  return window.__sobreMetaPixelState;
}

function markFired(key: string) {
  getMetaPixelState().firedKeys[key] = true;
}

function hasFired(key: string) {
  return !!getMetaPixelState().firedKeys[key];
}

function ensureMetaPixel() {
  const pixelId = getMetaPixelId();
  if (!pixelId || typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const state = getMetaPixelState();
  if (state.initialized && typeof window.fbq === "function") {
    return true;
  }

  if (typeof window.fbq !== "function") {
    const fbq =
      function (...args: unknown[]) {
        if (typeof fbq.callMethod === "function") {
          fbq.callMethod(...args);
        } else {
          fbq.queue.push(args);
        }
      } as typeof window.fbq & {
        callMethod?: (...args: unknown[]) => void;
        queue: unknown[][];
        loaded?: boolean;
        version?: string;
        push: (...args: unknown[]) => number;
      };

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = (...args: unknown[]) => fbq.queue.push(args);

    window.fbq = fbq;
    if (!window._fbq) {
      window._fbq = fbq;
    }
  }

  const existingScript = document.querySelector(`script[src="${META_PIXEL_SCRIPT_SRC}"]`);
  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = META_PIXEL_SCRIPT_SRC;
    document.head.appendChild(script);
  }

  if (!state.initialized) {
    window.fbq?.("init", pixelId);
    state.initialized = true;
  }

  return true;
}

export function trackMetaPageView(path = window.location.pathname, search = window.location.search) {
  if (!ensureMetaPixel()) return;

  const eventKey = `PageView:${path}${search}`;
  if (hasFired(eventKey)) return;

  window.fbq?.("track", "PageView");
  markFired(eventKey);
}

export function trackMetaEvent(eventName: string, params?: MetaTrackParams) {
  if (!ensureMetaPixel()) return;
  window.fbq?.("track", eventName, params);
}

export function trackMetaEventOnce(eventKey: string, eventName: string, params?: MetaTrackParams) {
  if (!ensureMetaPixel() || hasFired(eventKey)) return;

  window.fbq?.("track", eventName, params);
  markFired(eventKey);
}

export function savePendingPurchase(payload: PendingPurchasePayload) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(META_PIXEL_STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingPurchase() {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(META_PIXEL_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingPurchasePayload;
    if (parsed?.currency !== "EUR" || typeof parsed?.value !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPurchase() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(META_PIXEL_STORAGE_KEY);
}
