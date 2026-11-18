import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { PatientScreen } from "@/features/patients/ui/patient-screen";
import { ApiError } from "@/lib/api/types";

const nav = vi.hoisted(() => {
  const state = {
    pathname: "/patients",
    search: "",
    params: new URLSearchParams(""),
    push: vi.fn(),
    replace: vi.fn(),
    setSearch(search: string) {
      state.search = search;
      state.params = new URLSearchParams(search);
    },
    reset() {
      state.pathname = "/patients";
      state.setSearch("");
      state.push.mockReset();
      state.replace.mockReset();
    },
  };
  return state;
});

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  useSearchParams: () => nav.params,
}));

const harness = vi.hoisted(() => ({
  mode: "loading" as "loading" | "empty" | "error" | "ready",
  query: {} as Record<string, unknown>,
  refetch: vi.fn(),
}));

vi.mock("@/features/patients/hooks/use-patient-list", () => ({
  usePatientList: (query: Record<string, unknown>) => {
    harness.query = query;

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
    if (harness.mode === "empty") {
      return {
        isLoading: false,
        isSuccess: true,
        isError: false,
        data: { items: [], meta: { page: 1, limit: 15, total: 0, totalPages: 0 } },
        error: null,
        refetch: harness.refetch,
      };
    }

    const page = typeof query.page === "number" ? query.page : 1;
    const limit = typeof query.limit === "number" ? query.limit : 15;

    return {
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: { items: [], meta: { page, limit, total: 1000, totalPages: Math.ceil(1000 / limit) } },
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

const doctorId = "665f1c0a2b3c4d5e6f708193";

afterEach(() => {
  cleanup();
  harness.mode = "loading";
  harness.query = {};
  harness.refetch.mockReset();
  nav.reset();
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
  render(<PatientScreen doctorId={doctorId} doctorName="Amelia Rahman" />);

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

test("reads the filters and paging from the URL", () => {
  harness.mode = "ready";
  nav.setSearch(
    "q=Noah&condition=stable&doctorId=665f1c0a2b3c4d5e6f708193&registeredFrom=2026-11-01&registeredTo=2026-11-30&page=2&limit=30",
  );

  render(<PatientScreen />);

  expect(harness.query).toMatchObject({
    q: "Noah",
    condition: "stable",
    doctorId: "665f1c0a2b3c4d5e6f708193",
    registeredFrom: "2026-11-01",
    registeredTo: "2026-11-30",
    page: 2,
    limit: 30,
    sort: "registeredAt",
  });
});

test("keeps condition and dates on a doctor page but drops the doctor filter", () => {
  harness.mode = "ready";
  nav.pathname = `/doctors/${doctorId}`;
  nav.setSearch("q=Noah&condition=stable&registeredFrom=2026-11-01&page=2");

  render(<PatientScreen doctorId={doctorId} doctorName="Amelia Rahman" />);

  expect(harness.query).toMatchObject({
    q: "Noah",
    condition: "stable",
    doctorId,
    registeredFrom: "2026-11-01",
    page: 2,
  });
  expect(harness.query.registeredTo).toBeUndefined();
});

test("applies a condition filter on a doctor page", async () => {
  harness.mode = "ready";
  nav.pathname = `/doctors/${doctorId}`;
  const user = userEvent.setup();

  render(<PatientScreen doctorId={doctorId} doctorName="Amelia Rahman" />);
  await user.click(screen.getByRole("combobox", { name: "Condition" }));
  await user.click(await screen.findByRole("option", { name: "Stable" }));
  await user.click(screen.getByRole("button", { name: "Apply" }));

  expect(nav.replace).toHaveBeenCalledWith(`/doctors/${doctorId}?condition=stable`, {
    scroll: false,
  });
});

test("drops a reversed date range but keeps the rest of the URL", () => {
  harness.mode = "ready";
  nav.setSearch("q=Noah&registeredFrom=2026-11-30&registeredTo=2026-11-01");

  render(<PatientScreen />);

  expect(harness.query).toMatchObject({ q: "Noah" });
  expect(harness.query.registeredFrom).toBeUndefined();
  expect(harness.query.registeredTo).toBeUndefined();
});

test("pushes the next page and keeps the filters", async () => {
  harness.mode = "ready";
  nav.setSearch("q=Noah&page=2");
  const user = userEvent.setup();

  render(<PatientScreen />);
  await user.click(screen.getByRole("button", { name: "Next page" }));

  expect(nav.push).toHaveBeenCalledWith("/patients?q=Noah&page=3", { scroll: false });
});

test("writes the page size and returns to the first page", async () => {
  harness.mode = "ready";
  nav.setSearch("q=Noah&page=4");
  const user = userEvent.setup();

  render(<PatientScreen />);
  await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
  await user.click(await screen.findByRole("option", { name: "50" }));

  expect(nav.replace).toHaveBeenCalledWith("/patients?q=Noah&limit=50", { scroll: false });
});

test("keeps the doctor route when the page size changes", async () => {
  harness.mode = "ready";
  nav.pathname = `/doctors/${doctorId}`;
  nav.setSearch("q=Noah&page=3");
  const user = userEvent.setup();

  render(<PatientScreen doctorId={doctorId} doctorName="Amelia Rahman" />);
  await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
  await user.click(await screen.findByRole("option", { name: "30" }));

  expect(nav.replace).toHaveBeenCalledWith(`/doctors/${doctorId}?q=Noah&limit=30`, {
    scroll: false,
  });
});
