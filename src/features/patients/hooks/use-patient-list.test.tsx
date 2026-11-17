import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { usePatientList } from "@/features/patients/hooks/use-patient-list";
import { createQueryClient } from "@/lib/query/query-client";

const api = "http://api.test";
const server = setupServer();

const patient = {
  id: "pat-1",
  doctorId: "665f1c0a2b3c4d5e6f708193",
  doctorName: "Amelia Rahman",
  fullName: "Noah Khan",
  dateOfBirth: "1984-04-12",
  sex: "male",
  phone: "+1 202 555 0199",
  email: "noah@example.com",
  condition: "stable",
  notes: "Registered from the cardiology clinic.",
  registeredAt: "2026-11-16T00:00:00.000Z",
  createdAt: "2026-11-16T08:00:00.000Z",
  updatedAt: "2026-11-16T08:00:00.000Z",
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

test("loads patients under the list query key", async () => {
  const query = { page: 1, limit: 20, sort: "registeredAt" as const };

  server.use(
    http.get(`${api}/patients`, () =>
      HttpResponse.json({
        success: true,
        message: "Patients retrieved successfully",
        data: [patient],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    ),
  );

  const client = createQueryClient();
  const { result } = renderHook(() => usePatientList(query), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.data?.items[0]?.fullName).toBe("Noah Khan"));
  expect(client.getQueryCache().find({ queryKey: ["patients", query] })).toBeDefined();
});

test("keeps the same key shape when doctorId comes from the doctor page", async () => {
  const query = {
    doctorId: "665f1c0a2b3c4d5e6f708193",
    page: 1,
    limit: 20,
    sort: "registeredAt" as const,
  };

  server.use(
    http.get(`${api}/patients`, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get("doctorId")).toBe(query.doctorId);
      return HttpResponse.json({
        success: true,
        message: "Patients retrieved successfully",
        data: [patient],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    }),
  );

  const client = createQueryClient();
  const { result } = renderHook(() => usePatientList(query), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(client.getQueryCache().find({ queryKey: ["patients", query] })?.queryKey).toEqual([
    "patients",
    query,
  ]);
});
