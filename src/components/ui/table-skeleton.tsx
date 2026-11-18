"use client";

import { useEffect, useState } from "react";

import { DATA_LOADING_DELAY_MS } from "@/components/ui/data-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type TableSkeletonColumn = {
  key: string;
  /** Grid span and visibility classes, e.g. `col-span-3 xl:col-span-2`. */
  className?: string;
  headerWidth?: string;
  align?: "left" | "right";
  variant?: "text" | "badge" | "number" | "actions";
};

type TableSkeletonProps = {
  label: string;
  columns: TableSkeletonColumn[];
  /** Body rows to reserve. Capped so a 50-row page does not paint 50 placeholders. */
  rows?: number;
  showFilters?: boolean;
  showPager?: boolean;
};

const TEXT_WIDTHS = ["w-3/5", "w-4/5", "w-1/2", "w-2/3", "w-3/4"];

/**
 * Reserves the real list layout while the table loads: filter row, column
 * headers, desktop rows, the stacked phone records, and the pager. The delay
 * matches `DataLoading` so a fast response never flashes a placeholder.
 */
export function TableSkeleton({
  label,
  columns,
  rows = 8,
  showFilters = false,
  showPager = true,
}: TableSkeletonProps) {
  const [visible, setVisible] = useState(false);
  const visibleRows = Math.min(Math.max(rows, 1), 12);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), DATA_LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div aria-busy="true" role="status">
      <span className="sr-only">{label}</span>

      {showFilters ? (
        <div className="portal-card-pad border-b border-line" data-skeleton-filter-region="">
          <FilterSkeleton />
        </div>
      ) : null}

      <div className="portal-card-pad">
        <div className="hidden md:block">
          <div className="grid h-10 grid-cols-12 items-center bg-inset px-1">
            {columns.map((column) => (
              <div
                className={cn("flex min-w-0 px-2", column.className, justify(column))}
                key={column.key}
              >
                <Skeleton className={cn("h-2.5", column.headerWidth ?? "w-12")} />
              </div>
            ))}
          </div>

          <div>
            {Array.from({ length: visibleRows }, (_, rowIndex) => (
              <div
                className="grid min-h-(--row-height) grid-cols-12 items-center border-b border-line px-1 last:border-0"
                data-skeleton-row=""
                key={rowIndex}
              >
                {columns.map((column) => (
                  <div
                    className={cn("flex min-w-0 px-2", column.className, justify(column))}
                    key={column.key}
                  >
                    <CellSkeleton column={column} rowIndex={rowIndex} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <ul className="record-grid grid md:hidden">
          {Array.from({ length: Math.min(visibleRows, 4) }, (_, index) => (
            <li className="record-card" data-skeleton-card="" key={index}>
              <div className="record-card-head">
                <Skeleton className="size-9 rounded-(--radius-control)" />
                <div className="record-identity flex flex-col gap-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>

              <div className="record-facts">
                <div className="record-fact flex flex-col gap-2">
                  <Skeleton className="h-2 w-10" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="record-fact flex flex-col gap-2">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              <div className="record-actions">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="size-9" />
              </div>
            </li>
          ))}
        </ul>

        {showPager ? <PagerSkeleton /> : null}
      </div>
    </div>
  );
}

function CellSkeleton({ column, rowIndex }: { column: TableSkeletonColumn; rowIndex: number }) {
  if (column.variant === "badge") {
    return <Skeleton className="h-5 w-16 rounded-full" />;
  }

  if (column.variant === "number") {
    return <Skeleton className="h-3 w-8" />;
  }

  if (column.variant === "actions") {
    return (
      <span className="flex items-center gap-2">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="size-7 rounded-full" />
      </span>
    );
  }

  return (
    <Skeleton
      className={cn("h-3", TEXT_WIDTHS[(rowIndex + column.key.length) % TEXT_WIDTHS.length])}
    />
  );
}

function FilterSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-4" data-skeleton-filter="">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {Array.from({ length: 4 }, (_, index) => (
          <div className="flex flex-col gap-2 xl:col-span-2" data-skeleton-filter="" key={index}>
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-2.5 w-40" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

function PagerSkeleton() {
  return (
    <div className="pagination" data-skeleton-pager="">
      <Skeleton className="h-3 w-40" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24" />
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="size-9" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function justify(column: TableSkeletonColumn): string | undefined {
  return column.align === "right" ? "justify-end" : undefined;
}
