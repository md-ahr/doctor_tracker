import { expect, test, vi } from "vitest";

vi.mock("@/lib/api/doctor-tracker-api", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
}));

test("authApi re-exports login, logout, and me", async () => {
  const client = await import("@/lib/api/doctor-tracker-api");
  const { authApi } = await import("@/features/auth/api/auth-api");

  expect(authApi.login).toBe(client.login);
  expect(authApi.logout).toBe(client.logout);
  expect(authApi.me).toBe(client.me);
});
