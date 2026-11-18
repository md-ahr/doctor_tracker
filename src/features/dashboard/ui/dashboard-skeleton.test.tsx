import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { DATA_LOADING_DELAY_MS } from "@/components/ui/data-state";
import { DashboardSkeleton } from "@/features/dashboard/ui/dashboard-skeleton";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("reserves the dashboard layout after the anti-flicker delay", async () => {
  vi.useFakeTimers();
  const view = render(<DashboardSkeleton />);

  expect(screen.queryByText("Loading dashboard")).toBeNull();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(DATA_LOADING_DELAY_MS);
  });

  const region = screen.getByRole("status");
  expect(region.getAttribute("aria-busy")).toBe("true");
  expect(region.querySelectorAll("[data-skeleton-stat]")).toHaveLength(4);
  expect(region.querySelectorAll("[data-skeleton-card]")).toHaveLength(7);
  expect(region.querySelectorAll("[data-skeleton-chart]")).toHaveLength(2);
  expect(region.querySelectorAll("[data-skeleton-roster-row]")).toHaveLength(5);
  expect(region.querySelectorAll("[data-skeleton-condition-row]")).toHaveLength(6);
  expect(region.querySelectorAll("[data-skeleton-highlight-row]")).toHaveLength(5);
  expect(region.querySelectorAll("[data-skeleton-day]")).toHaveLength(35);

  view.unmount();
});

test("uses the card headings the loaded screen will replace", async () => {
  vi.useFakeTimers();
  const view = render(<DashboardSkeleton label="Loading clinic totals" />);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(DATA_LOADING_DELAY_MS);
  });

  expect(screen.getByText("Loading clinic totals")).toBeTruthy();
  expect(screen.queryByRole("heading")).toBeNull();

  view.unmount();
});
