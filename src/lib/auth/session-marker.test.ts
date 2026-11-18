import { afterEach, expect, test } from "vitest";

import { SESSION_MARKER_COOKIE } from "@/lib/auth/cookies";
import { clearSessionMarker, markSession } from "@/lib/auth/session-marker";

function markerValue(): string | null {
  const prefix = `${SESSION_MARKER_COOKIE}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : null;
}

afterEach(() => {
  clearSessionMarker();
});

test("marks the portal origin with a path-wide session hint", () => {
  clearSessionMarker();
  markSession();

  expect(markerValue()).toBe("1");
});

test("removes the session hint", () => {
  markSession();
  clearSessionMarker();

  expect(markerValue()).toBeNull();
});
