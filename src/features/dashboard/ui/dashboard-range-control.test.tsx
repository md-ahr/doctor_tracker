import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { DashboardRangeControl } from "@/features/dashboard/ui/dashboard-range-control";

/** Every calendar helper reads "today" from `Temporal.Now`, so one stub fixes the clock. */
const TODAY = "2026-11-18";

beforeEach(() => {
  vi.spyOn(Temporal.Now, "plainDateISO").mockReturnValue(Temporal.PlainDate.from(TODAY));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type User = ReturnType<typeof userEvent.setup>;

function renderControl(onCommit: (range: unknown) => void) {
  render(<DashboardRangeControl from="2026-10-20" onCommit={onCommit} timeZone="UTC" to={TODAY} />);
}

async function chooseRange(user: User, label: string) {
  await user.click(screen.getByRole("combobox", { name: "Date range" }));
  await user.click(await screen.findByRole("option", { name: label }));
}

/** Picks a day from the month the calendar opens on, optionally one month back. */
async function pickDay(user: User, label: "From" | "To", isoDate: string, previousMonth = false) {
  await user.click(screen.getByRole("button", { name: `${label} date` }));
  if (previousMonth) {
    await user.click(screen.getByRole("button", { name: "Go to the Previous Month" }));
  }

  const cell = document.querySelector(`[data-day="${isoDate}"] button`);
  expect(cell).not.toBeNull();

  await user.click(cell as HTMLButtonElement);
}

test("shows the preset window that matches the current range", () => {
  renderControl(vi.fn());

  expect(screen.getByRole("combobox", { name: "Date range" }).textContent).toContain(
    "Last 30 days",
  );
  expect(screen.queryByRole("button", { name: "From date" })).toBeNull();
});

test("a preset commits its inclusive window", async () => {
  const user = userEvent.setup();
  const onCommit = vi.fn();
  renderControl(onCommit);

  await chooseRange(user, "Last 7 days");

  expect(onCommit).toHaveBeenCalledWith({ from: "2026-11-12", to: TODAY });
});

test("custom range reveals the date fields without changing the query", async () => {
  const user = userEvent.setup();
  const onCommit = vi.fn();
  renderControl(onCommit);

  await chooseRange(user, "Custom range");

  expect(onCommit).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "From date" })).toBeDefined();
  expect(screen.getByRole("button", { name: "To date" })).toBeDefined();
});

test("commits a valid custom range", async () => {
  const user = userEvent.setup();
  const onCommit = vi.fn();
  renderControl(onCommit);

  await chooseRange(user, "Custom range");

  await pickDay(user, "From", "2026-10-10");
  expect(onCommit).toHaveBeenLastCalledWith({ from: "2026-10-10", to: TODAY });

  await pickDay(user, "To", "2026-11-15");
  expect(onCommit).toHaveBeenLastCalledWith({ from: "2026-10-10", to: "2026-11-15" });
});

test("a reversed custom range is reported inline instead of being queried", async () => {
  const user = userEvent.setup();
  const onCommit = vi.fn();
  renderControl(onCommit);

  await chooseRange(user, "Custom range");
  await pickDay(user, "From", "2026-10-25");
  onCommit.mockClear();

  await pickDay(user, "To", "2026-10-05", true);

  expect(onCommit).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toContain("From must be on or before To.");
  expect(screen.getByRole("button", { name: "From date" }).getAttribute("aria-invalid")).toBe(
    "true",
  );
});
