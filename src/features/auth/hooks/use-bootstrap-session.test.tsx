import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { useBootstrapSession } from "@/features/auth/hooks/use-bootstrap-session";
import { ApiError } from "@/lib/api/types";
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

test("is ready without refreshing when an access token is already set", async () => {
  setAccessToken("jwt-1");
  const { result } = renderHook(() => useBootstrapSession());

  expect(result.current.status).toBe("ready");
  await waitFor(() => expect(refresh).not.toHaveBeenCalled());
});

test("sends the admin to login when the refresh says the session is gone", async () => {
  const assign = vi.fn();
  vi.stubGlobal("location", { assign });
  refresh.mockRejectedValue(new ApiError(401, "UNAUTHENTICATED", "Sign in to continue"));
  markSession();

  renderHook(() => useBootstrapSession());

  await waitFor(() => expect(assign).toHaveBeenCalledWith("/login"));
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(document.cookie).not.toContain("dt_session");
});

test("keeps the admin on the portal when the API is briefly unreachable", async () => {
  const assign = vi.fn();
  vi.stubGlobal("location", { assign });
  refresh.mockRejectedValue(new ApiError(503, "INTERNAL", "Could not refresh your session"));
  markSession();

  const { result } = renderHook(() => useBootstrapSession());

  await waitFor(() => expect(result.current.status).toBe("unavailable"));
  expect(assign).not.toHaveBeenCalled();
  expect(document.cookie).toContain("dt_session");
});

test("retry makes the portal ready once the API answers", async () => {
  refresh.mockRejectedValueOnce(new ApiError(503, "INTERNAL", "Could not refresh your session"));
  refresh.mockResolvedValueOnce(undefined);

  const { result } = renderHook(() => useBootstrapSession());

  await waitFor(() => expect(result.current.status).toBe("unavailable"));

  await act(async () => {
    result.current.retry();
  });

  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(refresh).toHaveBeenCalledTimes(2);
});
