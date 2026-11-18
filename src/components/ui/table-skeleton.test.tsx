import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { DATA_LOADING_DELAY_MS } from "@/components/ui/data-state";
import { TableSkeleton, type TableSkeletonColumn } from "@/components/ui/table-skeleton";

const columns: TableSkeletonColumn[] = [
  { key: "name", className: "col-span-4", headerWidth: "w-16" },
  { key: "condition", className: "col-span-4", headerWidth: "w-16", variant: "badge" },
  {
    key: "count",
    align: "right",
    className: "col-span-4",
    headerWidth: "w-14",
    variant: "number",
  },
];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("holds the list layout after the anti-flicker delay", async () => {
  vi.useFakeTimers();
  const view = render(
    <TableSkeleton columns={columns} label="Loading doctors" rows={3} showFilters />,
  );

  expect(screen.queryByText("Loading doctors")).toBeNull();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(DATA_LOADING_DELAY_MS);
  });

  const region = screen.getByRole("status");
  expect(region.getAttribute("aria-busy")).toBe("true");
  expect(region.querySelectorAll("[data-skeleton-filter]")).toHaveLength(5);
  expect(region.querySelectorAll("[data-skeleton-row]")).toHaveLength(3);
  expect(region.querySelectorAll("[data-skeleton-card]")).toHaveLength(3);
  expect(region.querySelector("[data-skeleton-pager]")).not.toBeNull();
  expect(screen.queryByRole("table")).toBeNull();

  view.unmount();
});

test("leaves the pager out when the caller already knows there are no results", async () => {
  vi.useFakeTimers();
  const view = render(
    <TableSkeleton columns={columns} label="Loading patients" rows={2} showPager={false} />,
  );

  await act(async () => {
    await vi.advanceTimersByTimeAsync(DATA_LOADING_DELAY_MS);
  });

  const region = screen.getByRole("status");
  expect(region.querySelector("[data-skeleton-filter-region]")).toBeNull();
  expect(region.querySelector("[data-skeleton-pager]")).toBeNull();

  view.unmount();
});
