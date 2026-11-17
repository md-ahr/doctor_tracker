import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import {
  createDoctor,
  createPatientUnderDoctor,
  doctorFacets,
  getDoctor,
  listDoctorPatients,
  listDoctors,
  updateDoctor,
  type Doctor,
} from "@/lib/api/doctor-tracker-api";

const api = "http://api.test";
const server = setupServer();

const doctor: Doctor = {
  id: "doc-1",
  name: "Amelia Rahman",
  specialization: "Cardiology",
  hospital: "City General",
  phone: "+1 202 555 0148",
  email: "amelia@citygeneral.example",
  createdAt: "2026-11-01T10:00:00.000Z",
  updatedAt: "2026-11-01T10:00:00.000Z",
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

test("list parses top-level meta and omits empty optional filters", async () => {
  server.use(
    http.get(`${api}/api/v1/doctors`, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get("q")).toBeNull();
      expect(url.searchParams.get("specialization")).toBeNull();
      expect(url.searchParams.get("hospital")).toBe("City General");
      expect(url.searchParams.get("page")).toBe("1");
      expect(url.searchParams.get("limit")).toBe("10");
      expect(url.searchParams.get("sort")).toBe("name");

      return HttpResponse.json({
        success: true,
        message: "Doctors retrieved successfully",
        data: [doctor],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    }),
  );

  const page = await listDoctors({
    q: "",
    specialization: undefined,
    hospital: "City General",
    page: 1,
    limit: 10,
    sort: "name",
  });

  expect(page.items).toEqual([doctor]);
  expect(page.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
});

test("creates, reads, updates, and lists a doctor's patients", async () => {
  server.use(
    http.post(`${api}/api/v1/doctors`, () =>
      HttpResponse.json(
        { success: true, message: "Doctor created successfully", data: doctor },
        { status: 201 },
      ),
    ),
    http.get(`${api}/api/v1/doctors/facets`, () =>
      HttpResponse.json({
        success: true,
        message: "Doctor facets retrieved successfully",
        data: { specializations: ["Cardiology"], hospitals: ["City General"] },
      }),
    ),
    http.get(`${api}/api/v1/doctors/doc-1`, () =>
      HttpResponse.json({
        success: true,
        message: "Doctor retrieved successfully",
        data: { ...doctor, activePatientCount: 2 },
      }),
    ),
    http.patch(`${api}/api/v1/doctors/doc-1`, () =>
      HttpResponse.json({
        success: true,
        message: "Doctor updated successfully",
        data: { ...doctor, hospital: "River Clinic" },
      }),
    ),
    http.get(`${api}/api/v1/doctors/doc-1/patients`, () =>
      HttpResponse.json({
        success: true,
        message: "Patients retrieved successfully",
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      }),
    ),
    http.post(`${api}/api/v1/doctors/doc-1/patients`, () =>
      HttpResponse.json(
        {
          success: true,
          message: "Patient created successfully",
          data: {
            id: "pat-1",
            doctorId: "doc-1",
            doctorName: doctor.name,
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
          },
        },
        { status: 201 },
      ),
    ),
  );

  await expect(
    createDoctor({
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
    }),
  ).resolves.toEqual(doctor);

  await expect(doctorFacets()).resolves.toEqual({
    specializations: ["Cardiology"],
    hospitals: ["City General"],
  });
  await expect(getDoctor("doc-1")).resolves.toMatchObject({ activePatientCount: 2 });
  await expect(updateDoctor("doc-1", { hospital: "River Clinic" })).resolves.toMatchObject({
    hospital: "River Clinic",
  });
  await expect(
    listDoctorPatients("doc-1", { page: 1, limit: 10, sort: "registeredAt" }),
  ).resolves.toMatchObject({ items: [], meta: { total: 0, totalPages: 0 } });
  await expect(
    createPatientUnderDoctor("doc-1", { fullName: "Noah Khan", condition: "stable" }),
  ).resolves.toMatchObject({ id: "pat-1", fullName: "Noah Khan" });
});
