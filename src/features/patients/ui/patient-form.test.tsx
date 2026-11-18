import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import type { Patient } from "@/features/patients/model/patient";
import { PatientFormDialog } from "@/features/patients/ui/patient-form";
import { createQueryClient } from "@/lib/query/query-client";

const api = "http://api.test";
const server = setupServer();
const patientGets: string[] = [];

const patient: Patient = {
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

afterEach(() => {
  cleanup();
  patientGets.length = 0;
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

test("seeds the dialog from the row and does not fetch the patient by id", async () => {
  server.use(
    http.get(`${api}/patients/:patientId`, ({ request }) => {
      patientGets.push(request.method);
      return HttpResponse.json(
        {
          success: false,
          message: "Patient not found",
          error: { code: "NOT_FOUND", details: [] },
        },
        { status: 404 },
      );
    }),
  );

  renderDialog();

  expect(screen.getByRole("textbox", { name: /Full name/ })).toHaveProperty("value", "Noah Khan");
  expect(screen.getByRole("combobox", { name: /Condition/ }).textContent).toBe("Stable");
  expect(screen.getByRole("combobox", { name: /Sex/ }).textContent).toBe("Male");
  expect(screen.getByRole("button", { name: /Registered date/ }).textContent).toContain(
    "16 Nov 2026",
  );
  expect(patientGets).toEqual([]);
});

test("marks required fields with an asterisk instead of helper copy", () => {
  renderDialog();

  expect(screen.queryByText("Required")).toBeNull();
  expect(screen.queryByText("Optional")).toBeNull();
  expect(screen.getByRole("textbox", { name: /Full name/ }).getAttribute("aria-required")).toBe(
    "true",
  );
  expect(document.querySelectorAll('label > span[aria-hidden="true"]')).toHaveLength(3);
});

test("changes the condition through the select popup", async () => {
  const user = userEvent.setup();
  renderDialog();

  await user.click(screen.getByRole("combobox", { name: /Condition/ }));
  await user.click(screen.getByRole("option", { name: "Recovering" }));

  expect(screen.getByRole("combobox", { name: /Condition/ }).textContent).toBe("Recovering");
});

function renderDialog() {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <PatientFormDialog
        doctors={[]}
        includeDoctor={false}
        onOpenChange={() => undefined}
        open
        patient={patient}
      />
    </QueryClientProvider>,
  );
}
