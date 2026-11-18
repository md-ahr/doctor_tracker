import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { useBootstrapSession } from "@/features/auth/hooks/use-bootstrap-session";
import { clearAccessToken, setAccessToken } from "@/lib/auth/access-token";
import { clearSessionMarker, markSession } from "@/lib/auth/session-marker";

const refresh = vi.fn();

vi.mock("@/features/auth/api/auth-api", () => ({
  authApi: {
    refresh: (...args: unknown[]) => refresh(...args),
  },
}));

afterEach(() => {
  refresh.mockReset();
  clearAccessToken();
  clearSessionMarker();
  vi.unstubAllGlobals();
});

test("skips refresh when an access token is already set", async () => {
  setAccessToken("jwt-1");
  const { result } = renderHook(() => useBootstrapSession());

  expect(result.current.ready).toBe(true);
  await waitFor(() => expect(refresh).not.toHaveBeenCalled());
});

test("sends the admin to login when refresh fails", async () => {
  const assign = vi.fn();
  vi.stubGlobal("location", { assign });
  refresh.mockRejectedValue(new Error("no session"));
  markSession();

  renderHook(() => useBootstrapSession());

  await waitFor(() => expect(assign).toHaveBeenCalledWith("/login"));
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(document.cookie).not.toContain("dt_session");
});
