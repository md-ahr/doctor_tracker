import { http, HttpResponse } from "msw";

import type { Dashboard } from "@/lib/api/dashboard-types";

const admin = {
  id: "admin-1",
  name: "Avery Admin",
  email: "admin@example.com",
};

const emptyPage = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const dashboardFixture: Dashboard = {
  range: { from: "2026-10-20", to: "2026-11-18", timezone: "UTC" },
  totals: { doctors: 1, patients: 1 },
  patientsPerDoctor: [
    {
      doctorId: "doc-1",
      name: "Amelia Rahman",
      specialization: "Cardiology",
      patientCount: 1,
    },
  ],
  patientsByCondition: [{ condition: "stable", patientCount: 1 }],
  patientsRegisteredByDay: [{ date: "2026-11-18", count: 1 }],
  doctorsCreatedByDay: [{ date: "2026-11-18", count: 1 }],
};

function ok(message: string, data: unknown, meta?: typeof emptyPage) {
  return HttpResponse.json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export const handlers = [
  http.post("*/auth/login", () =>
    ok("Signed in successfully", {
      accessToken: "jwt-1",
      expiresIn: 900,
      admin,
    }),
  ),
  http.post("*/auth/refresh", () =>
    ok("Session refreshed successfully", {
      accessToken: "jwt-2",
      expiresIn: 900,
      admin,
    }),
  ),
  http.post("*/auth/logout", () => ok("Signed out successfully", null)),
  http.get("*/auth/me", () => ok("Admin profile retrieved successfully", admin)),
  http.get("*/doctors", () => ok("Doctors retrieved successfully", [], emptyPage)),
  http.get("*/patients", () => ok("Patients retrieved successfully", [], emptyPage)),
  http.get("*/dashboard", () => ok("Dashboard retrieved successfully", dashboardFixture)),
];
