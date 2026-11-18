import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { DoctorSummary } from "@/features/doctors/ui/doctor-summary";

vi.mock("@/features/doctors/hooks/use-doctor", () => ({
  useDoctor: () => ({
    isLoading: false,
    isError: false,
    data: {
      id: "doc-1",
      name: "Amelia Rahman",
      specialization: "Cardiology",
      hospital: "City General",
      phone: "+1 202 555 0148",
      email: "amelia@citygeneral.example",
      activePatientCount: 4,
      createdAt: "2026-11-01T10:00:00.000Z",
      updatedAt: "2026-11-01T10:00:00.000Z",
    },
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/doctors/ui/doctor-form", () => ({
  DoctorFormDialog: () => <button type="button">Edit details</button>,
}));

afterEach(() => {
  cleanup();
});

test("shows the doctor identity, initials, and contact facts", () => {
  render(<DoctorSummary doctorId="doc-1" />);

  expect(screen.getByRole("heading", { name: "Amelia Rahman", level: 1 })).toBeTruthy();
  expect(screen.getByText("Cardiology · City General")).toBeTruthy();
  expect(screen.getByText("AR")).toBeTruthy();
  expect(screen.getByText("+1 202 555 0148")).toBeTruthy();
  expect(screen.getByText("amelia@citygeneral.example")).toBeTruthy();
  expect(screen.getByText("4")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Edit details" })).toBeTruthy();
});
