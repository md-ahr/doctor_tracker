import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import type { Dashboard } from "@/features/dashboard/model/dashboard";
import { createQueryClient } from "@/lib/query/query-client";

const api = "http://api.test";
const server = setupServer();

const dashboard: Dashboard = {
  range: { from: "2026-10-20", to: "2026-11-18", timezone: "UTC" },
  totals: { doctors: 12, patients: 148 },
  patientsPerDoctor: [],
  patientsByCondition: [],
  patientsRegisteredByDay: [{ date: "2026-11-18", count: 1 }],
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

test("keeps the dashboard fresh for 60 seconds under the range key", async () => {
  server.use(
    http.get(`${api}/dashboard`, () =>
      HttpResponse.json({
        success: true,
        message: "Dashboard retrieved successfully",
        data: dashboard,
      }),
    ),
  );

  const client = createQueryClient();
  const { result } = renderHook(() => useDashboard("2026-10-20", "2026-11-18"), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.data?.totals.patients).toBe(148));

  const query = client
    .getQueryCache()
    .find({ queryKey: ["dashboard", "2026-10-20", "2026-11-18"] });
  expect((query?.options as { staleTime?: number } | undefined)?.staleTime).toBe(60_000);
});
