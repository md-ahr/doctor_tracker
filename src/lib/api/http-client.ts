import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/access-token";
import { clearSessionMarker, markSession } from "@/lib/auth/session-marker";

import { ApiError, type ApiErrorBody, type ApiSuccess } from "./types";

let refreshPromise: Promise<boolean> | null = null;

function apiOrigin(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

async function refreshSession(): Promise<boolean> {
  refreshPromise ??= fetch(`${apiOrigin()}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) return false;
      const body = (await response.json()) as ApiSuccess<{ accessToken: string }>;
      setAccessToken(body.data.accessToken);
      markSession();
      return true;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
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
    const refreshed = await refreshSession();
    if (refreshed) return apiRequest<T>(path, init, false);
    clearAccessToken();
    clearSessionMarker();
    if (typeof window !== "undefined") {
      // Not a React render path. A failed refresh must drop the in-memory session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    }
    throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue");
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
