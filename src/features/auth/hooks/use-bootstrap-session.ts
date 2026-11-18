"use client";

import { useCallback, useEffect, useState } from "react";

import { authApi } from "@/features/auth/api/auth-api";
import { ApiError } from "@/lib/api/types";
import { getAccessToken } from "@/lib/auth/access-token";
import { clearSessionMarker } from "@/lib/auth/session-marker";

export type BootstrapStatus = "checking" | "ready" | "unavailable";

export function useBootstrapSession() {
  const [status, setStatus] = useState<BootstrapStatus>(() =>
    getAccessToken() ? "ready" : "checking",
  );
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    if (getAccessToken()) {
      setStatus("ready");
      return;
    }

    setStatus("checking");
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    if (status !== "checking" || getAccessToken()) return;

    let active = true;
    authApi
      .refresh()
      .then(() => {
        if (active) setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;

        if (error instanceof ApiError && error.status === 401) {
          clearSessionMarker();
          if (typeof window !== "undefined") {
            // The gate is not a React navigation. A failed refresh must leave the portal.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign("/login");
          }
          return;
        }

        // The API is unreachable or starting. Keep the session hint and let the
        // admin retry instead of signing them out over a transient failure.
        setStatus("unavailable");
      });

    return () => {
      active = false;
    };
  }, [attempt, status]);

  return { status, retry };
}
