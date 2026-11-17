import { QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { useDoctor } from "@/features/doctors/hooks/use-doctor";
import { DoctorSummary } from "@/features/doctors/ui/doctor-summary";
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

function doctorResponse() {
  return HttpResponse.json({
    success: true,
    message: "Doctor retrieved successfully",
    data: {
      id: "doc-1",
      name: "Amelia Rahman",
      specialization: "Cardiology",
      hospital: "City General",
      phone: "+1 202 555 0148",
      email: "amelia@citygeneral.example",
      createdAt: "2026-11-01T10:00:00.000Z",
      updatedAt: "2026-11-01T10:00:00.000Z",
      activePatientCount: 4,
    },
  });
}

test("loads one doctor under the id key and shows the active patient count", async () => {
  server.use(http.get(`${api}/doctors/doc-1`, () => doctorResponse()));
  const client = createQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  const { result } = renderHook(() => useDoctor("doc-1"), { wrapper: Wrapper });
  await waitFor(() => expect(result.current.data?.activePatientCount).toBe(4));
  expect(client.getQueryCache().find({ queryKey: ["doctors", "doc-1"] })).toBeDefined();

  render(
    <Wrapper>
      <DoctorSummary doctorId="doc-1" />
    </Wrapper>,
  );

  expect(await screen.findByRole("heading", { name: "Amelia Rahman" })).toBeDefined();
  expect(screen.getByText("4")).toBeDefined();
});
