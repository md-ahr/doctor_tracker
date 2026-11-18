import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { DoctorDetailScreen } from "@/features/doctors/ui/doctor-detail-screen";
import { ApiError } from "@/lib/api/types";

const useDoctor = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));

vi.mock("@/features/doctors/hooks/use-doctor", () => ({ useDoctor }));

vi.mock("@/features/doctors/ui/doctor-summary", () => ({
  DoctorSummary: () => <p>Doctor summary</p>,
}));

vi.mock("@/features/patients/ui/patient-screen", () => ({
  PatientScreen: () => <p>Patient list</p>,
}));

const recordId = "65f1c0a2b4d9e81f2a3c4d5e";

function doctorQuery(overrides: Record<string, unknown>) {
  return { isLoading: false, isError: false, data: undefined, error: null, ...overrides };
}

afterEach(() => {
  cleanup();
  useDoctor.mockReset();
});

test("a doctor the API cannot find becomes the missing-record view, not an error band", () => {
  useDoctor.mockReturnValue(
    doctorQuery({
      isError: true,
      error: new ApiError(404, "DOCTOR_NOT_FOUND", "Doctor not found"),
    }),
  );

  render(<DoctorDetailScreen doctorId={recordId} />);

  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "This doctor isn't in the directory",
  );
  expect(screen.getByRole("link", { name: "Back to doctors" }).getAttribute("href")).toBe(
    "/doctors",
  );
  expect(screen.queryByText("Doctor summary")).toBeNull();
  expect(screen.queryByText("Patient list")).toBeNull();
});

test("an id the API rejects is also treated as missing", () => {
  useDoctor.mockReturnValue(
    doctorQuery({
      isError: true,
      error: new ApiError(400, "VALIDATION_ERROR", "Request validation failed"),
    }),
  );

  render(<DoctorDetailScreen doctorId={recordId} />);

  expect(screen.getByText("Error 404")).toBeDefined();
});

test("a transient failure stays on the screen with its retry affordance", () => {
  useDoctor.mockReturnValue(
    doctorQuery({ isError: true, error: new ApiError(503, "INTERNAL", "Server unavailable") }),
  );

  render(<DoctorDetailScreen doctorId={recordId} />);

  expect(screen.getByText("Doctor summary")).toBeDefined();
  expect(screen.getByText("Patient list")).toBeDefined();
  expect(screen.queryByText("Error 404")).toBeNull();
});
