import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import {
  useCreatePatient,
  useDeletePatient,
} from "@/features/patients/hooks/use-patient-mutations";
import { createQueryClient } from "@/lib/query/query-client";

const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));

const api = "http://api.test";
const server = setupServer();
const doctorId = "665f1c0a2b3c4d5e6f708193";

const patient = {
  id: "pat-1",
  doctorId,
  doctorName: "Amelia Rahman",
  fullName: "Noah Khan",
  dateOfBirth: null,
  sex: null,
  phone: null,
  email: null,
  condition: "stable",
  notes: null,
  registeredAt: "2026-11-16T00:00:00.000Z",
  createdAt: "2026-11-16T08:00:00.000Z",
  updatedAt: "2026-11-16T08:00:00.000Z",
};

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", api);
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

test("invalidates patients, the doctor, and the dashboard after delete", async () => {
  server.use(
    http.delete(`${api}/patients/pat-1`, () =>
      HttpResponse.json({
        success: true,
        message: "Patient deleted successfully",
        data: null,
      }),
    ),
  );

  const client = createQueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  const { result } = renderHook(() => useDeletePatient(), { wrapper: Wrapper });
  await result.current.mutateAsync({ id: "pat-1", doctorId, fullName: "Noah Khan" });

  await waitFor(() => {
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["patients"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["doctors", doctorId] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
  });
  expect(toastSuccess).toHaveBeenCalledWith("Patient deleted", {
    description: "Noah Khan was removed.",
  });
});

test("invalidates the same keys after creating a patient under a doctor", async () => {
  server.use(
    http.post(`${api}/doctors/${doctorId}/patients`, () =>
      HttpResponse.json({
        success: true,
        message: "Patient created successfully",
        data: patient,
      }),
    ),
  );

  const client = createQueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  const { result } = renderHook(() => useCreatePatient(), { wrapper: Wrapper });
  await result.current.mutateAsync({
    doctorId,
    body: { fullName: "Noah Khan", condition: "stable", registeredAt: "2026-11-16" },
  });

  await waitFor(() => {
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["patients"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["doctors", doctorId] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
  });
  expect(toastSuccess).toHaveBeenCalledWith("Patient added", {
    description: "Noah Khan was added to the directory.",
  });
});

test("reports a failed delete with the server message", async () => {
  server.use(
    http.delete(`${api}/patients/pat-1`, () =>
      HttpResponse.json(
        {
          success: false,
          message: "Patient not found",
          data: null,
          error: { code: "NOT_FOUND", details: [] },
        },
        { status: 404 },
      ),
    ),
  );

  const client = createQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  const { result } = renderHook(() => useDeletePatient(), { wrapper: Wrapper });

  await expect(
    result.current.mutateAsync({ id: "pat-1", doctorId, fullName: "Noah Khan" }),
  ).rejects.toThrow("Patient not found");
  expect(toastError).toHaveBeenCalledWith("Could not delete patient", {
    description: "Patient not found",
  });
});
