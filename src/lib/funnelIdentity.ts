export type FunnelIdentity = {
  userId: string;
  userIdTs: string;
  userIdSig: string;
};

export const TRIAL_REMINDER_STEP = "trial-reminder";
export const TRIAL_REMINDER_PATH = "/start-first5";
export const SANDBOX_FALLBACK_QUERY_PARAM = "sandbox";
export const SANDBOX_DEFAULT_USER_ID = String(import.meta.env.VITE_SANDBOX_USER_ID || "sbx_user_123").trim();

type ReadFunnelIdentityOptions = {
  allowSandboxFallback?: boolean;
};

export function isSandboxAppUserId(userId: string): boolean {
  return String(userId || "").trim() === SANDBOX_DEFAULT_USER_ID;
}

export function getCheckoutIdentityError(identity: FunnelIdentity): string | null {
  if (identity.userId && isSandboxAppUserId(identity.userId)) {
    return `Checkout bloque : l'app_user_id sandbox ${SANDBOX_DEFAULT_USER_ID} est refuse pour un paiement reel.`;
  }
  return null;
}

export function readFunnelIdentityFromSearch(
  search: string,
  options: ReadFunnelIdentityOptions = {},
): FunnelIdentity {
  const params = new URLSearchParams(search);
  const userId = String(
    params.get("userId") || params.get("app_user_id") || params.get("user_id") || "",
  ).trim();
  const userIdTs = String(params.get("userIdTs") || params.get("user_id_ts") || "").trim();
  const userIdSig = String(
    params.get("userIdSig") || params.get("user_id_sig") || params.get("app_user_sig") || "",
  ).trim();

  if (userId) return { userId, userIdTs, userIdSig };

  const sandboxFallbackRequested =
    options.allowSandboxFallback &&
    import.meta.env.DEV &&
    params.get(SANDBOX_FALLBACK_QUERY_PARAM) === "1" &&
    SANDBOX_DEFAULT_USER_ID;

  if (sandboxFallbackRequested) {
    return { userId: SANDBOX_DEFAULT_USER_ID, userIdTs: "", userIdSig: "" };
  }

  return { userId: "", userIdTs, userIdSig };
}

export function buildTrialReminderUrl(search: string): string {
  const identity = readFunnelIdentityFromSearch(search);
  const params = new URLSearchParams({ step: TRIAL_REMINDER_STEP });
  if (identity.userId) params.set("userId", identity.userId);
  if (identity.userIdTs) params.set("userIdTs", identity.userIdTs);
  if (identity.userIdSig) params.set("userIdSig", identity.userIdSig);
  return `${TRIAL_REMINDER_PATH}?${params.toString()}`;
}
