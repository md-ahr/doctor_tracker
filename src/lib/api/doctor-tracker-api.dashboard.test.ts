import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { getDashboard } from "@/lib/api/doctor-tracker-api";
import type { Dashboard } from "@/lib/api/dashboard-types";

const api = "http://api.test";
const server = setupServer();

const dashboard: Dashboard = {
  range: { from: "2026-10-20", to: "2026-11-18", timezone: "UTC" },
  totals: { doctors: 12, patients: 148 },
  patientsPerDoctor: [],
  patientsByCondition: [{ condition: "stable", patientCount: 80 }],
  patientsRegisteredByDay: [{ date: "2026-11-18", count: 0 }],
  doctorsCreatedByDay: [{ date: "2026-11-18", count: 0 }],
};

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", api);
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

test("passes from and to when they are set", async () => {
  server.use(
    http.get(`${api}/dashboard`, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get("from")).toBe("2026-10-20");
      expect(url.searchParams.get("to")).toBe("2026-11-18");
      return HttpResponse.json({
        success: true,
        message: "Dashboard retrieved successfully",
        data: dashboard,
      });
    }),
  );

  await expect(getDashboard({ from: "2026-10-20", to: "2026-11-18" })).resolves.toEqual(dashboard);
});

test("omits the query string when the range is empty", async () => {
  server.use(
    http.get(`${api}/dashboard`, ({ request }) => {
      expect(new URL(request.url).search).toBe("");
      return HttpResponse.json({
        success: true,
        message: "Dashboard retrieved successfully",
        data: dashboard,
      });
    }),
  );

  await expect(getDashboard()).resolves.toEqual(dashboard);
});
