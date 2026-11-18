import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { DoctorScreen } from "@/features/doctors/ui/doctor-screen";
import { ApiError } from "@/lib/api/types";

const harness = vi.hoisted(() => ({
  mode: "loading" as "loading" | "empty" | "error",
  refetch: vi.fn(),
}));

vi.mock("@/features/doctors/hooks/use-doctor-list", () => ({
  useDoctorList: () => {
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
}));

vi.mock("@/features/doctors/hooks/use-doctor-facets", () => ({
  useDoctorFacets: () => ({ data: { specializations: [], hospitals: [] } }),
}));

vi.mock("@/features/doctors/ui/doctor-form", () => ({
  DoctorFormDialog: () => <button type="button">Add doctor</button>,
}));

afterEach(() => {
  cleanup();
  harness.mode = "loading";
  harness.refetch.mockReset();
});

test("shows a loading region without the empty copy", async () => {
  harness.mode = "loading";
  render(<DoctorScreen />);

  expect(screen.queryByText("No doctors yet")).toBeNull();
  expect(screen.queryByRole("table")).toBeNull();
  expect(await screen.findByText("Loading doctors")).toBeDefined();
  expect(screen.queryByText("No doctors yet")).toBeNull();
  expect(screen.queryByRole("table")).toBeNull();
});

test("shows the empty directory copy", () => {
  harness.mode = "empty";
  render(<DoctorScreen />);

  expect(screen.getByText("No doctors yet")).toBeDefined();
  expect(screen.getByText("Add the first doctor to start the directory.")).toBeDefined();
  expect(screen.queryByRole("table")).toBeNull();
});

test("shows the error band and retries", async () => {
  harness.mode = "error";
  const user = userEvent.setup();
  render(<DoctorScreen />);

  expect(screen.getByText("The directory could not be loaded.")).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(harness.refetch).toHaveBeenCalled();
});
