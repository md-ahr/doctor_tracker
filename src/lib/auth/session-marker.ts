import { SESSION_MARKER_COOKIE, SESSION_MARKER_MAX_AGE_SECONDS } from "@/lib/auth/cookies";

/**
 * The API sets its HttpOnly refresh cookie on the API origin, scoped to `/api/v1/auth`.
 * The portal origin can never read it, so `proxy.ts` cannot use it as its gate.
 *
 * This marker is the first-party hint the proxy reads. It carries no credential: the API
 * remains the authority, and a failed refresh clears the marker.
 */
export function markSession(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_MARKER_COOKIE}=1; Path=/; Max-Age=${SESSION_MARKER_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearSessionMarker(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_MARKER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
