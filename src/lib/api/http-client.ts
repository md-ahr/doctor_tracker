import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/access-token";
import { clearSessionMarker, markSession } from "@/lib/auth/session-marker";

import { ApiError, type ApiErrorBody, type ApiSuccess } from "./types";

export interface RefreshedSession {
  accessToken: string;
  expiresIn: number;
  admin: { id: string; name: string; email: string };
}

export type RefreshOutcome =
  | { status: "refreshed"; body: ApiSuccess<RefreshedSession> }
  | { status: "unauthenticated" }
  | { status: "error" };

/** A rotation race with another tab resolves within a tick of the winner. */
const RACE_RETRY_DELAY_MS = 200;
/** A cold container or a dropped connection is not a signed-out admin. */
const ERROR_RETRY_DELAYS_MS = [250, 750];

let inflightRefresh: Promise<RefreshOutcome> | null = null;

function apiOrigin(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function requestRefresh(): Promise<RefreshOutcome> {
  let response: Response;
  try {
    response = await fetch(`${apiOrigin()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    return { status: "error" };
  }

  if (response.status === 401 || response.status === 403) {
    return { status: "unauthenticated" };
  }

  if (!response.ok) {
    return { status: "error" };
  }

  const body = (await response.json().catch(() => null)) as ApiSuccess<RefreshedSession> | null;
  if (!body?.data?.accessToken) {
    return { status: "error" };
  }

  setAccessToken(body.data.accessToken);
  markSession();
  return { status: "refreshed", body };
}

async function refreshWithRetry(): Promise<RefreshOutcome> {
  let outcome = await requestRefresh();
  if (outcome.status === "refreshed") return outcome;

  if (outcome.status === "unauthenticated") {
    // Another tab may have rotated the cookie a moment ago. The cookie jar is
    // shared, so a short retry can pick up the winner's token.
    await delay(RACE_RETRY_DELAY_MS);
    return requestRefresh();
  }

  for (const wait of ERROR_RETRY_DELAYS_MS) {
    await delay(wait);
    outcome = await requestRefresh();
    if (outcome.status !== "error") return outcome;
  }

  return outcome;
}

/**
 * The only way the app obtains a fresh access token. Every caller shares one
 * in-flight request, so rotation happens once even when several mounts ask.
 */
export function refreshSession(): Promise<RefreshOutcome> {
  inflightRefresh ??= refreshWithRetry().finally(() => {
    inflightRefresh = null;
  });
  return inflightRefresh;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<ApiSuccess<T>> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiOrigin()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const isCredentialRequest = path.endsWith("/auth/login") || path.endsWith("/auth/refresh");
  if (response.status === 401 && retry && !isCredentialRequest) {
    const outcome = await refreshSession();
    if (outcome.status === "refreshed") return apiRequest<T>(path, init, false);
    clearAccessToken();

    if (outcome.status === "unauthenticated") {
      clearSessionMarker();
      if (typeof window !== "undefined") {
        // Not a React render path. A failed refresh must drop the in-memory session.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
      }
      throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue");
    }

    // Transient failure: keep the session hint so a later attempt can recover.
    throw new ApiError(503, "INTERNAL", "Could not refresh your session");
  }

  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiErrorBody | null;

  if (!response.ok || !body || body.success === false) {
    const errorBody = body && body.success === false ? body : null;
    throw new ApiError(
      response.status,
      errorBody?.error.code ?? "INTERNAL",
      errorBody?.message ?? "Something went wrong",
      errorBody?.error.details ?? [],
    );
  }

  return body;
}
