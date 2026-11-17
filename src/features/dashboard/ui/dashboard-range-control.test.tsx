import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { DashboardRangeControl } from "@/features/dashboard/ui/dashboard-range-control";

afterEach(() => {
  cleanup();
});

function setDate(label: string, value: string) {
  const input = screen.getByLabelText(label);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
}

test("invalid order does not change hook inputs", () => {
  const onCommit = vi.fn();
  render(
    <DashboardRangeControl from="2026-10-20" onCommit={onCommit} timeZone="UTC" to="2026-11-18" />,
  );

  setDate("To", "2026-10-01");

  expect(onCommit).not.toHaveBeenCalled();
  expect(screen.getByText("From must be on or before To.")).toBeTruthy();
});

test("a valid range is committed for the dashboard query", () => {
  const onCommit = vi.fn();
  render(
    <DashboardRangeControl from="2026-10-20" onCommit={onCommit} timeZone="UTC" to="2026-11-18" />,
  );

  setDate("From", "2026-11-01");

  expect(onCommit).toHaveBeenCalledWith({ from: "2026-11-01", to: "2026-11-18" });
});
