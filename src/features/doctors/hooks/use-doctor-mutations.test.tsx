import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { useCreateDoctor } from "@/features/doctors/hooks/use-doctor-mutations";
import { createQueryClient } from "@/lib/query/query-client";

const api = "http://api.test";
const server = setupServer();

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", api);
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

test("invalidates doctor queries after create", async () => {
  server.use(
    http.post(`${api}/doctors`, () =>
      HttpResponse.json({
        success: true,
        message: "Doctor created successfully",
        data: {
          id: "doc-1",
          name: "Amelia Rahman",
          specialization: "Cardiology",
          hospital: "City General",
          phone: "+1 202 555 0148",
          email: "amelia@citygeneral.example",
          createdAt: "2026-11-01T10:00:00.000Z",
          updatedAt: "2026-11-01T10:00:00.000Z",
        },
      }),
    ),
  );

  const client = createQueryClient();
  client.setQueryData(["doctors", { page: 1 }], {
    items: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  const { result } = renderHook(() => useCreateDoctor(), { wrapper: Wrapper });

  await result.current.mutateAsync({
    name: "Amelia Rahman",
    specialization: "Cardiology",
    hospital: "City General",
    phone: "+1 202 555 0148",
    email: "amelia@citygeneral.example",
  });

  await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["doctors"] }));
});
