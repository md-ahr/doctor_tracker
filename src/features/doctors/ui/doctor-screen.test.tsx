import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { DoctorScreen } from "@/features/doctors/ui/doctor-screen";
import { ApiError } from "@/lib/api/types";

const nav = vi.hoisted(() => {
  const state = {
    pathname: "/doctors",
    search: "",
    params: new URLSearchParams(""),
    push: vi.fn(),
    replace: vi.fn(),
    setSearch(search: string) {
      state.search = search;
      state.params = new URLSearchParams(search);
    },
    reset() {
      state.pathname = "/doctors";
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
  total: 1000,
  refetch: vi.fn(),
}));

vi.mock("@/features/doctors/hooks/use-doctor-list", () => ({
  useDoctorList: (query: Record<string, unknown>) => {
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
    const totalPages = Math.ceil(harness.total / limit);

    return {
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: { items: [], meta: { page, limit, total: harness.total, totalPages } },
      error: null,
      refetch: harness.refetch,
    };
  },
}));

vi.mock("@/features/doctors/hooks/use-doctor-facets", () => ({
  useDoctorFacets: () => ({ data: { specializations: [], hospitals: [] } }),
}));

vi.mock("@/features/doctors/hooks/use-doctor-patient-counts", () => ({
  useDoctorPatientCounts: () => ({ data: {} }),
}));

vi.mock("@/features/doctors/ui/doctor-form", () => ({
  DoctorFormDialog: () => <button type="button">Add doctor</button>,
}));

afterEach(() => {
  cleanup();
  harness.mode = "loading";
  harness.query = {};
  harness.total = 1000;
  harness.refetch.mockReset();
  nav.reset();
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

test("reads the filters and paging from the URL", () => {
  harness.mode = "ready";
  nav.setSearch("q=Amelia&specialization=Cardiology&hospital=City+General&page=3&limit=50");

  render(<DoctorScreen />);

  expect(harness.query).toMatchObject({
    q: "Amelia",
    specialization: "Cardiology",
    hospital: "City General",
    page: 3,
    limit: 50,
    sort: "createdAt",
  });
});

test("ignores URL values the screen does not offer", () => {
  harness.mode = "ready";
  nav.setSearch("page=-2&limit=999&createdFrom=2026-02-30");

  render(<DoctorScreen />);

  expect(harness.query).toMatchObject({ page: 1, limit: 15 });
  expect(harness.query.createdFrom).toBeUndefined();
});

test("pushes the next page and keeps the filters", async () => {
  harness.mode = "ready";
  nav.setSearch("q=Amelia&page=3");
  const user = userEvent.setup();

  render(<DoctorScreen />);
  await user.click(screen.getByRole("button", { name: "Next page" }));

  expect(nav.push).toHaveBeenCalledWith("/doctors?q=Amelia&page=4", { scroll: false });
});

test("applies the draft search and drops the page", async () => {
  harness.mode = "ready";
  nav.setSearch("q=Amelia&page=4");
  const user = userEvent.setup();

  render(<DoctorScreen />);
  const search = screen.getByRole("textbox", { name: "Search" });
  await user.clear(search);
  await user.type(search, "  Imran  ");
  await user.click(screen.getByRole("button", { name: "Apply" }));

  expect(nav.replace).toHaveBeenCalledWith("/doctors?q=Imran", { scroll: false });
});

test("resets back to the bare directory URL", async () => {
  harness.mode = "ready";
  nav.setSearch("q=Amelia&page=4");
  const user = userEvent.setup();

  render(<DoctorScreen />);
  await user.click(screen.getByRole("button", { name: "Reset" }));

  expect(nav.replace).toHaveBeenCalledWith("/doctors", { scroll: false });
});

test("rewrites a page that no longer exists", async () => {
  harness.mode = "ready";
  harness.total = 10;
  nav.setSearch("q=Amelia&page=9");

  render(<DoctorScreen />);

  await waitFor(() =>
    expect(nav.replace).toHaveBeenCalledWith("/doctors?q=Amelia", { scroll: false }),
  );
});
