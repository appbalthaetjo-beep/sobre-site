export function getApiBaseUrl() {
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");

  if (fromEnv) return fromEnv;

  // Fallback: same-origin (works for Vercel/SPA with `/api/*` routes).
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // Last resort: relative URLs.
  return "";
}
