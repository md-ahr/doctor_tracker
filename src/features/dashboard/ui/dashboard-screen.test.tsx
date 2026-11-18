import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { DashboardScreen } from "@/features/dashboard/ui/dashboard-screen";
import type { Dashboard } from "@/lib/api/dashboard-types";
import { createQueryClient } from "@/lib/query/query-client";

const api = "http://api.test";
const server = setupServer();

const dashboard: Dashboard = {
  range: { from: "2026-10-20", to: "2026-11-18", timezone: "UTC" },
  totals: { doctors: 2, patients: 3 },
  patientsPerDoctor: [
    { doctorId: "doc-1", name: "Amelia Rahman", specialization: "Cardiology", patientCount: 3 },
  ],
  patientsByCondition: [{ condition: "stable", patientCount: 3 }],
  patientsRegisteredByDay: [{ date: "2026-11-18", count: 3 }],
  doctorsCreatedByDay: [{ date: "2026-11-18", count: 1 }],
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

test("loads one dashboard query and passes the series into the charts", async () => {
  let calls = 0;
  server.use(
    http.get(`${api}/dashboard`, () => {
      calls += 1;
      return HttpResponse.json({
        success: true,
        message: "Dashboard retrieved successfully",
        data: dashboard,
      });
    }),
  );

  render(
    <QueryClientProvider client={createQueryClient()}>
      <DashboardScreen />
    </QueryClientProvider>,
  );

  expect(await screen.findByRole("heading", { name: "Over this range" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Registration trend" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "By condition" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Patients per doctor" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Care mix" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Range at a glance" })).toBeTruthy();
  expect(calls).toBe(1);
});
