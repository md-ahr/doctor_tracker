import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { PatientScreen } from "@/features/patients/ui/patient-screen";
import { ApiError } from "@/lib/api/types";

const harness = vi.hoisted(() => ({
  mode: "loading" as "loading" | "empty" | "error",
  refetch: vi.fn(),
}));

vi.mock("@/features/patients/hooks/use-patient-list", () => ({
  usePatientList: () => {
    if (harness.mode === "loading") {
      return {
        isLoading: true,
        isSuccess: false,
        isError: false,
        data: undefined,
        error: null,
        refetch: harness.refetch,
      };
    }
    if (harness.mode === "error") {
      return {
        isLoading: false,
        isSuccess: false,
        isError: true,
        data: undefined,
        error: new ApiError(500, "INTERNAL", "The directory could not be loaded."),
        refetch: harness.refetch,
      };
    }
    return {
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      error: null,
      refetch: harness.refetch,
    };
  },
  useDoctorDirectory: () => ({ data: [] }),
}));

vi.mock("@/features/patients/ui/patient-create-dialog", () => ({
  PatientCreateDialog: () => <button type="button">Add patient</button>,
}));

vi.mock("@/features/patients/ui/patient-form", () => ({
  PatientFormDialog: () => null,
}));

afterEach(() => {
  cleanup();
  harness.mode = "loading";
  harness.refetch.mockReset();
});

test("shows a loading region without the empty copy", async () => {
  harness.mode = "loading";
  render(<PatientScreen />);

  expect(screen.queryByText("No patients yet")).toBeNull();
  expect(screen.queryByRole("table")).toBeNull();
  expect(await screen.findByText("Loading patients")).toBeDefined();
  expect(screen.queryByText("No patients yet")).toBeNull();
  expect(screen.queryByRole("table")).toBeNull();
});

test("shows the empty directory copy", () => {
  harness.mode = "empty";
  render(<PatientScreen />);

  expect(screen.getByText("No patients yet")).toBeDefined();
  expect(screen.getByText("Open a doctor and add a patient.")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Add patient" })).toBeNull();
  expect(screen.queryByRole("table")).toBeNull();
});

test("shows the doctor-scoped empty copy", () => {
  harness.mode = "empty";
  render(<PatientScreen doctorId="665f1c0a2b3c4d5e6f708193" doctorName="Amelia Rahman" />);

  expect(screen.getByText("No patients for this doctor")).toBeDefined();
  expect(screen.getByText("Add a patient to assign them here.")).toBeDefined();
  expect(screen.getAllByRole("button", { name: "Add patient" }).length).toBeGreaterThan(0);
});

test("shows the error band and retries", async () => {
  harness.mode = "error";
  const user = userEvent.setup();
  render(<PatientScreen />);

  expect(screen.getByText("The directory could not be loaded.")).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(harness.refetch).toHaveBeenCalled();
});
