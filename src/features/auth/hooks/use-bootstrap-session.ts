"use client";

import { useEffect, useState } from "react";

import { authApi } from "@/features/auth/api/auth-api";
import { getAccessToken } from "@/lib/auth/access-token";
import { clearSessionMarker } from "@/lib/auth/session-marker";

export function useBootstrapSession() {
  const [ready, setReady] = useState(() => getAccessToken() !== null);

  useEffect(() => {
    if (getAccessToken()) return;

    let cancelled = false;
    authApi
      .refresh()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (cancelled || typeof window === "undefined") return;
        clearSessionMarker();
        // The gate is not a React navigation. A failed refresh must leave the portal.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready };
}
