"use client";

import { useId, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/paging";
import type { PageMeta } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export { PAGE_SIZE_OPTIONS };
export type { PageSize };

/** Numbers kept visible around the current page. */
const WINDOW_SIZE = 3;

/** Below this many pages every number fits without collapsing. */
const MAX_FULL_PAGES = 7;

export type PaginationItem = number | "ellipsis";

/**
 * Builds the visible page slots, e.g. `1 2 3 … 15 16 17`.
 * Numbers adjacent to the current page plus the first and last page stay
 * visible; larger gaps collapse into a single ellipsis marker.
 */
export function getPageItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= MAX_FULL_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = Math.min(Math.max(page, 1), totalPages);
  const windowStart = Math.min(
    Math.max(current - Math.floor(WINDOW_SIZE / 2), 1),
    totalPages - WINDOW_SIZE + 1,
  );
  const visible = new Set<number>([1, totalPages]);

  for (let candidate = windowStart; candidate < windowStart + WINDOW_SIZE; candidate += 1) {
    visible.add(candidate);
  }

  const items: PaginationItem[] = [];
  let previous = 0;

  for (const candidate of [...visible].sort((a, b) => a - b)) {
    const gap = candidate - previous - 1;
    if (gap === 1) items.push(candidate - 1);
    else if (gap > 1) items.push("ellipsis");
    items.push(candidate);
    previous = candidate;
  }

  return items;
}

type PaginationProps = {
  meta?: PageMeta;
  limit: PageSize;
  itemCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: PageSize) => void;
};

/**
 * Footer pager. Everything sits on one line from tablet width up; on phones the
 * numbered slots collapse so only the step controls and the page position stay
 * reachable without wrapping.
 */
export function Pagination({
  meta,
  limit,
  itemCount,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const sizeId = useId();
  const total = meta?.total ?? itemCount;
  const page = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);
  const pageItems = getPageItems(page, totalPages);
  const atStart = currentPage <= 1;
  const atEnd = currentPage >= totalPages;

  // Everything already fits on one screen, so the pager earns no space.
  if (total <= DEFAULT_PAGE_SIZE) return null;

  return (
    <div className="pagination">
      <p className="pagination-summary">
        Showing{" "}
        <span className="pagination-strong">
          {start}–{end}
        </span>{" "}
        of <span className="pagination-strong">{total.toLocaleString("en-GB")}</span>
      </p>

      <div className="pagination-controls">
        <div className="pagination-size">
          <label htmlFor={sizeId}>Rows per page</label>
          <Select
            onValueChange={(value) => {
              const next = Number(value ?? 0);
              if (PAGE_SIZE_OPTIONS.includes(next as PageSize)) onPageSizeChange(next as PageSize);
            }}
            value={String(limit)}
          >
            <SelectTrigger className="h-9 w-18 justify-between px-2.5" id={sizeId} size="compact">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav aria-label="Pagination" className="pagination-nav">
          <span className="sr-only">
            Page {currentPage} of {totalPages}
          </span>

          <div className="pagination-steps">
            <PagerButton disabled={atStart} label="First page" onClick={() => onPageChange(1)}>
              <DoubleChevronIcon direction="left" />
            </PagerButton>
            <PagerButton
              disabled={atStart}
              label="Previous page"
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronIcon direction="left" />
            </PagerButton>
          </div>

          <span aria-hidden="true" className="pagination-position sm:hidden">
            Page {currentPage} of {totalPages}
          </span>

          <div className="pagination-pages hidden sm:flex">
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span className="pagination-gap" key={`ellipsis-${index}`}>
                  …<span className="sr-only">More pages</span>
                </span>
              ) : (
                <Button
                  aria-current={item === currentPage ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  className={cn(
                    "pagination-page",
                    item === currentPage && "pagination-page-active",
                  )}
                  key={item}
                  onClick={() => {
                    if (item !== currentPage) onPageChange(item);
                  }}
                  title={`Page ${item}`}
                  type="button"
                  variant={item === currentPage ? "primary" : "quiet"}
                >
                  {item}
                </Button>
              ),
            )}
          </div>

          <div className="pagination-steps">
            <PagerButton
              disabled={atEnd}
              label="Next page"
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronIcon direction="right" />
            </PagerButton>
            <PagerButton
              disabled={atEnd}
              label="Last page"
              onClick={() => onPageChange(totalPages)}
            >
              <DoubleChevronIcon direction="right" />
            </PagerButton>
          </div>
        </nav>
      </div>
    </div>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      aria-label={label}
      className="h-9 w-9 rounded-[9px] px-0 text-ink-secondary hover:bg-inset hover:text-ink disabled:bg-transparent disabled:text-ink-tertiary disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
      variant="quiet"
    >
      {children}
    </Button>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      viewBox="0 0 24 24"
      width="15"
      style={direction === "right" ? { transform: "rotate(180deg)" } : undefined}
    >
      <path
        d="m14.5 5.5-6.5 6.5 6.5 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function DoubleChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      viewBox="0 0 24 24"
      width="15"
      style={direction === "right" ? { transform: "rotate(180deg)" } : undefined}
    >
      <path
        d="M12.5 5.5 6 12l6.5 6.5M19.5 5.5 13 12l6.5 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
