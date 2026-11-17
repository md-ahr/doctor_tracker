import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import {
  deletePatient,
  listPatients,
  updatePatient,
  type Patient,
} from "@/lib/api/doctor-tracker-api";

const api = "http://api.test";
const server = setupServer();

const patient: Patient = {
  id: "pat-1",
  doctorId: "doc-1",
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

test("lists patients and updates one", async () => {
  server.use(
    http.get(`${api}/api/v1/patients`, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get("condition")).toBe("stable");
      expect(url.searchParams.get("q")).toBeNull();
      return HttpResponse.json({
        success: true,
        message: "Patients retrieved successfully",
        data: [patient],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    }),
    http.patch(`${api}/api/v1/patients/pat-1`, async ({ request }) => {
      expect(await request.json()).toEqual({ notes: null });
      return HttpResponse.json({
        success: true,
        message: "Patient updated successfully",
        data: { ...patient, notes: null },
      });
    }),
  );

  const page = await listPatients({
    q: "",
    condition: "stable",
    page: 1,
    limit: 10,
    sort: "registeredAt",
  });
  expect(page.items).toEqual([patient]);
  expect(page.meta.total).toBe(1);

  await expect(updatePatient("pat-1", { notes: null })).resolves.toMatchObject({ notes: null });
});

test("delete expects 200 and data null", async () => {
  server.use(
    http.delete(`${api}/api/v1/patients/pat-1`, () =>
      HttpResponse.json(
        { success: true, message: "Patient deleted successfully", data: null },
        { status: 200 },
      ),
    ),
  );

  await expect(deletePatient("pat-1")).resolves.toBeUndefined();
});
