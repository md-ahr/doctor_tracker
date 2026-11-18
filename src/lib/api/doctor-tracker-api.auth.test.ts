import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { login, logout, me, refresh } from "@/lib/api/doctor-tracker-api";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/access-token";
import { clearSessionMarker } from "@/lib/auth/session-marker";

const api = "http://api.test";
const server = setupServer();

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", api);
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
  clearAccessToken();
  clearSessionMarker();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

test("login stores the access token from the response body", async () => {
  server.use(
    http.post(`${api}/auth/login`, async ({ request }) => {
      expect(await request.json()).toEqual({
        email: "admin@example.com",
        password: "correct horse",
      });
      return HttpResponse.json({
        success: true,
        message: "Signed in successfully",
        data: {
          accessToken: "jwt-1",
          expiresIn: 900,
          admin: { id: "admin-1", name: "Avery Admin", email: "admin@example.com" },
        },
      });
    }),
  );

  const session = await login({ email: "admin@example.com", password: "correct horse" });

  expect(session.accessToken).toBe("jwt-1");
  expect(getAccessToken()).toBe("jwt-1");
  expect(document.cookie).toContain("dt_session=1");
});

test("refresh stores the replacement access token", async () => {
  server.use(
    http.post(`${api}/auth/refresh`, () =>
      HttpResponse.json({
        success: true,
        message: "Session refreshed successfully",
        data: {
          accessToken: "jwt-2",
          expiresIn: 900,
          admin: { id: "admin-1", name: "Avery Admin", email: "admin@example.com" },
        },
      }),
    ),
  );

  await refresh();

  expect(getAccessToken()).toBe("jwt-2");
  expect(document.cookie).toContain("dt_session=1");
});

test("logout posts with credentials and clears the access token", async () => {
  setAccessToken("jwt-1");
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  server.use(
    http.post(`${api}/auth/logout`, () =>
      HttpResponse.json({
        success: true,
        message: "Signed out successfully",
        data: null,
      }),
    ),
  );

  await logout();

  const logoutCall = fetchSpy.mock.calls.find(([input]) => String(input).includes("/auth/logout"));
  expect(logoutCall?.[1]).toEqual(
    expect.objectContaining({ credentials: "include", method: "POST" }),
  );
  expect(getAccessToken()).toBeNull();
  expect(document.cookie).not.toContain("dt_session");
  fetchSpy.mockRestore();
});

test("me returns the admin profile", async () => {
  server.use(
    http.get(`${api}/auth/me`, () =>
      HttpResponse.json({
        success: true,
        message: "Admin profile retrieved successfully",
        data: { id: "admin-1", name: "Avery Admin", email: "admin@example.com" },
      }),
    ),
  );

  await expect(me()).resolves.toEqual({
    id: "admin-1",
    name: "Avery Admin",
    email: "admin@example.com",
  });
});
