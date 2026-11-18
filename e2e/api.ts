import { expect, type Page, type Route } from "@playwright/test";

const apiRoutes = "**/api/v1";

const admin = {
  id: "admin-1",
  name: "Avery Admin",
  email: "admin@example.com",
};

const doctor = {
  id: "doc-1",
  name: "Amelia Rahman",
  specialization: "Cardiology",
  hospital: "City General",
  phone: "+1 202 555 0148",
  email: "amelia@citygeneral.example",
  createdAt: "2026-11-01T10:00:00.000Z",
  updatedAt: "2026-11-01T10:00:00.000Z",
};

const patient = {
  id: "pat-1",
  doctorId: doctor.id,
  doctorName: doctor.name,
  fullName: "Amina Rahman",
  dateOfBirth: null,
  sex: null,
  phone: "+1 202 555 0199",
  email: null,
  condition: "stable",
  notes: null,
  registeredAt: "2026-11-12",
  createdAt: "2026-11-12T08:00:00.000Z",
  updatedAt: "2026-11-12T08:00:00.000Z",
};

const pageMeta = { page: 1, limit: 20, total: 1, totalPages: 1 };

type DashboardMode = "filled" | "empty";

function envelope(message: string, data: unknown, meta?: typeof pageMeta) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    }),
  };
}

function dashboardBody(mode: DashboardMode) {
  const count = mode === "empty" ? 0 : 1;
  return {
    range: { from: "2026-10-20", to: "2026-11-18", timezone: "UTC" },
    totals: { doctors: mode === "empty" ? 0 : 1, patients: mode === "empty" ? 0 : 1 },
    patientsPerDoctor:
      mode === "empty"
        ? []
        : [
            {
              doctorId: doctor.id,
              name: doctor.name,
              specialization: doctor.specialization,
              patientCount: 1,
            },
          ],
    patientsByCondition: [{ condition: "stable", patientCount: count }],
    patientsRegisteredByDay: [{ date: "2026-11-18", count }],
    doctorsCreatedByDay: [{ date: "2026-11-18", count }],
  };
}

async function fulfill(route: Route, mode: DashboardMode) {
  const url = new URL(route.request().url());
  const path = url.pathname;
  const method = route.request().method();

  if (method === "POST" && path.endsWith("/auth/login")) {
    await route.fulfill(
      envelope("Signed in successfully", {
        accessToken: "jwt-1",
        expiresIn: 900,
        admin,
      }),
    );
    return;
  }

  if (method === "POST" && path.endsWith("/auth/refresh")) {
    await route.fulfill(
      envelope("Session refreshed successfully", {
        accessToken: "jwt-2",
        expiresIn: 900,
        admin,
      }),
    );
    return;
  }

  if (method === "GET" && path.endsWith("/auth/me")) {
    await route.fulfill(envelope("Admin profile retrieved successfully", admin));
    return;
  }

  if (method === "GET" && path.endsWith("/doctors/facets")) {
    await route.fulfill(
      envelope("Doctor facets retrieved successfully", {
        specializations: ["Cardiology"],
        hospitals: ["City General"],
      }),
    );
    return;
  }

  if (method === "GET" && path.endsWith("/doctors")) {
    await route.fulfill(envelope("Doctors retrieved successfully", [doctor], pageMeta));
    return;
  }

  if (method === "GET" && path.endsWith("/patients")) {
    await route.fulfill(envelope("Patients retrieved successfully", [patient], pageMeta));
    return;
  }

  if (method === "GET" && path.endsWith("/dashboard")) {
    await route.fulfill(envelope("Dashboard retrieved successfully", dashboardBody(mode)));
    return;
  }

  await route.fulfill({
    status: 404,
    contentType: "application/json",
    body: JSON.stringify({
      success: false,
      message: `No mock for ${method} ${path}`,
      data: null,
      error: { code: "NOT_FOUND", details: [] },
    }),
  });
}

export async function mockDirectory(page: Page, mode: DashboardMode = "filled") {
  await page.route(`${apiRoutes}/**`, (route) => fulfill(route, mode));
}

export async function signIn(page: Page, mode: DashboardMode = "filled") {
  await mockDirectory(page, mode);
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("correct horse");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function rejectLogin(page: Page) {
  await page.route(`${apiRoutes}/auth/login`, (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Invalid email or password",
        data: null,
        error: { code: "INVALID_CREDENTIALS", details: [] },
      }),
    }),
  );
}
