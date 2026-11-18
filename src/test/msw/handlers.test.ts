import { afterEach, expect, test, vi } from "vitest";

import { getDashboard, listDoctors, listPatients, login, me } from "@/lib/api/doctor-tracker-api";
import { clearAccessToken, getAccessToken } from "@/lib/auth/access-token";
import { dashboardFixture } from "@/test/msw/handlers";

afterEach(() => {
  clearAccessToken();
  vi.unstubAllEnvs();
});

test("default handlers answer auth, list envelopes, and the dashboard", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");

  const session = await login({ email: "admin@example.com", password: "secret" });
  expect(session.admin.email).toBe("admin@example.com");
  expect(getAccessToken()).toBe("jwt-1");

  await expect(me()).resolves.toEqual(session.admin);

  const doctors = await listDoctors({ page: 1, limit: 20, sort: "createdAt" });
  expect(doctors).toEqual({ items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });

  const patients = await listPatients({ page: 1, limit: 20, sort: "registeredAt" });
  expect(patients.items).toEqual([]);
  expect(patients.meta.total).toBe(0);

  await expect(getDashboard()).resolves.toEqual(dashboardFixture);
});
