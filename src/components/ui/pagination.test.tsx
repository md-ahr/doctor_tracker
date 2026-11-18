import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import {
  PAGE_SIZE_OPTIONS,
  Pagination,
  getPageItems,
  type PageSize,
} from "@/components/ui/pagination";
import type { PageMeta } from "@/lib/api/types";

afterEach(() => {
  cleanup();
});

const meta: PageMeta = { page: 2, limit: 15, total: 1000, totalPages: 67 };

function renderPagination(overrides: { meta?: PageMeta; limit?: PageSize } = {}) {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();
  render(
    <Pagination
      itemCount={15}
      limit={overrides.limit ?? 15}
      meta={overrides.meta ?? meta}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />,
  );
  return { onPageChange, onPageSizeChange };
}

test("shows the visible range and the current page", () => {
  renderPagination();

  expect(screen.getByText("16–30")).toBeDefined();
  expect(screen.getByText("1,000")).toBeDefined();
  expect(screen.getByRole("navigation", { name: "Pagination" }).textContent).toContain(
    "Page 2 of 67",
  );
});

test("clamps the range when the requested page no longer exists", () => {
  renderPagination({ meta: { page: 9, limit: 15, total: 100, totalPages: 1 } });

  expect(screen.getByText("1–15")).toBeDefined();
});

test("hides when the data already fits the default page size", () => {
  renderPagination({ meta: { page: 1, limit: 15, total: 10, totalPages: 1 } });

  expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
  expect(screen.queryByText(/Showing/)).toBeNull();
  expect(screen.queryByRole("combobox", { name: "Rows per page" })).toBeNull();
});

test("stays visible once the data exceeds the default page size", () => {
  renderPagination({ meta: { page: 1, limit: 15, total: 16, totalPages: 2 } });

  expect(screen.getByRole("navigation", { name: "Pagination" })).toBeDefined();
});

test("renders numbered page buttons with the current page marked", () => {
  renderPagination();

  expect(screen.getByRole("button", { name: "Page 2" }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBeNull();
  expect(screen.getByRole("button", { name: "Page 67" })).toBeDefined();
});

test("jumps with the previous and next controls", async () => {
  const user = userEvent.setup();
  const { onPageChange } = renderPagination();

  await user.click(screen.getByRole("button", { name: "Previous page" }));
  await user.click(screen.getByRole("button", { name: "Next page" }));

  expect(onPageChange.mock.calls).toEqual([[1], [3]]);
});

test("jumps to the first and last pages with the icon controls", async () => {
  const user = userEvent.setup();
  const { onPageChange } = renderPagination();

  await user.click(screen.getByRole("button", { name: "First page" }));
  await user.click(screen.getByRole("button", { name: "Last page" }));

  expect(onPageChange.mock.calls).toEqual([[1], [67]]);
});

test("jumps to a specific page number", async () => {
  const user = userEvent.setup();
  const { onPageChange } = renderPagination();

  await user.click(screen.getByRole("button", { name: "Page 67" }));

  expect(onPageChange).toHaveBeenCalledWith(67);
});

test("disables the backward controls on the first page", () => {
  renderPagination({ meta: { ...meta, page: 1 } });

  expect(screen.getByRole("button", { name: "First page" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("button", { name: "Previous page" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("button", { name: "Next page" }).hasAttribute("disabled")).toBe(false);
  expect(screen.getByRole("button", { name: "Last page" }).hasAttribute("disabled")).toBe(false);
});

test("disables the forward controls on the last page", () => {
  renderPagination({ meta: { ...meta, page: 67 } });

  expect(screen.getByRole("button", { name: "First page" }).hasAttribute("disabled")).toBe(false);
  expect(screen.getByRole("button", { name: "Previous page" }).hasAttribute("disabled")).toBe(
    false,
  );
  expect(screen.getByRole("button", { name: "Next page" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("button", { name: "Last page" }).hasAttribute("disabled")).toBe(true);
});

test("offers every allowed page size from the rows-per-page select", async () => {
  const user = userEvent.setup();
  renderPagination();

  await user.click(screen.getByRole("combobox", { name: "Rows per page" }));

  for (const size of PAGE_SIZE_OPTIONS) {
    expect(await screen.findByRole("option", { name: String(size) })).toBeDefined();
  }
});

test("changes the page size from the rows-per-page select", async () => {
  const user = userEvent.setup();
  const { onPageSizeChange } = renderPagination();
  const [largestSize] = [...PAGE_SIZE_OPTIONS].reverse();

  await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
  await user.click(await screen.findByRole("option", { name: String(largestSize) }));

  expect(onPageSizeChange).toHaveBeenCalledWith(largestSize);
});

test("lists every page number when the page count is small", () => {
  expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
  expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

test("collapses distant pages into ellipses around the current page", () => {
  expect(getPageItems(16, 17)).toEqual([1, "ellipsis", 15, 16, 17]);
  expect(getPageItems(9, 17)).toEqual([1, "ellipsis", 8, 9, 10, "ellipsis", 17]);
  expect(getPageItems(1, 17)).toEqual([1, 2, 3, "ellipsis", 17]);
  expect(getPageItems(2, 67)).toEqual([1, 2, 3, "ellipsis", 67]);
  expect(getPageItems(17, 17)).toEqual([1, "ellipsis", 15, 16, 17]);
  expect(getPageItems(40, 67)).toEqual([1, "ellipsis", 39, 40, 41, "ellipsis", 67]);
});

test("clamps out-of-range pages", () => {
  expect(getPageItems(0, 17)).toEqual([1, 2, 3, "ellipsis", 17]);
  expect(getPageItems(99, 17)).toEqual([1, "ellipsis", 15, 16, 17]);
});
