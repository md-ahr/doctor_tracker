import { afterEach, expect, test, vi } from "vitest";

import { apiRequest } from "@/lib/api/http-client";
import { ApiError } from "@/lib/api/types";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/access-token";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  clearAccessToken();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("retries once with the refreshed access token after a 401", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  setAccessToken("expired");

  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          message: "expired",
          data: null,
          error: { code: "UNAUTHENTICATED", details: [] },
        },
        401,
      ),
    )
    .mockResolvedValueOnce(
      jsonResponse({
        success: true,
        message: "Refreshed",
        data: { accessToken: "fresh" },
      }),
    )
    .mockResolvedValueOnce(
      jsonResponse({
        success: true,
        message: "Doctors loaded",
        data: [{ id: "doc-1" }],
      }),
    );
  vi.stubGlobal("fetch", fetchMock);

  const body = await apiRequest<{ id: string }[]>("/doctors");

  expect(body.data).toEqual([{ id: "doc-1" }]);
  expect(getAccessToken()).toBe("fresh");

  const retryHeaders = new Headers(
    (fetchMock.mock.calls[2]?.[1] as RequestInit | undefined)?.headers,
  );
  expect(retryHeaders.get("Authorization")).toBe("Bearer fresh");
  expect(fetchMock.mock.calls[1]?.[0]).toBe("http://api.test/auth/refresh");
});

test("does not loop when refresh fails and sends the admin to login", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  setAccessToken("expired");
  const assign = vi.fn();
  vi.stubGlobal("location", { assign });

  const fetchMock = vi.fn().mockResolvedValue(
    jsonResponse(
      {
        success: false,
        message: "no",
        data: null,
        error: { code: "UNAUTHENTICATED", details: [] },
      },
      401,
    ),
  );
  vi.stubGlobal("fetch", fetchMock);

  const error = await apiRequest("/doctors").catch((caught: unknown) => caught);

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(getAccessToken()).toBeNull();
  expect(assign).toHaveBeenCalledTimes(1);
  expect(assign).toHaveBeenCalledWith("/login");
});

test("does not refresh again when the refresh path itself returns 401", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  const assign = vi.fn();
  vi.stubGlobal("location", { assign });

  const fetchMock = vi.fn().mockResolvedValue(
    jsonResponse(
      {
        success: false,
        message: "Refresh failed",
        data: null,
        error: { code: "UNAUTHENTICATED", details: [] },
      },
      401,
    ),
  );
  vi.stubGlobal("fetch", fetchMock);

  await expect(apiRequest("/auth/refresh", { method: "POST" })).rejects.toMatchObject({
    status: 401,
    code: "UNAUTHENTICATED",
  });

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(assign).not.toHaveBeenCalled();
});
