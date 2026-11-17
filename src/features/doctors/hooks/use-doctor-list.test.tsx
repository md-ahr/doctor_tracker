import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { useDoctorFacets } from "@/features/doctors/hooks/use-doctor-facets";
import { useDoctorList } from "@/features/doctors/hooks/use-doctor-list";
import { createQueryClient } from "@/lib/query/query-client";

const api = "http://api.test";
const server = setupServer();

const query = { q: "Amelia", page: 1, limit: 20, sort: "createdAt" as const };

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", api);
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

test("loads doctors under the list query key", async () => {
  server.use(
    http.get(`${api}/doctors`, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get("q")).toBe("Amelia");
      return HttpResponse.json({
        success: true,
        message: "Doctors retrieved successfully",
        data: [
          {
            id: "doc-1",
            name: "Amelia Rahman",
            specialization: "Cardiology",
            hospital: "City General",
            phone: "+1 202 555 0148",
            email: "amelia@citygeneral.example",
            createdAt: "2026-11-01T10:00:00.000Z",
            updatedAt: "2026-11-01T10:00:00.000Z",
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    }),
  );

  const client = createQueryClient();
  const { result } = renderHook(() => useDoctorList(query), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.data?.items[0]?.name).toBe("Amelia Rahman"));
  expect(client.getQueryCache().find({ queryKey: ["doctors", query] })).toBeDefined();
});

test("loads facets under the facets key", async () => {
  server.use(
    http.get(`${api}/doctors/facets`, () =>
      HttpResponse.json({
        success: true,
        message: "Doctor facets retrieved successfully",
        data: { specializations: ["Cardiology"], hospitals: ["City General"] },
      }),
    ),
  );

  const client = createQueryClient();
  const { result } = renderHook(() => useDoctorFacets(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.data?.specializations).toEqual(["Cardiology"]));
  expect(client.getQueryCache().find({ queryKey: ["doctors", "facets"] })).toBeDefined();
});
