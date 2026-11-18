"use client";

import { useEffect, useState } from "react";

import { DATA_LOADING_DELAY_MS } from "@/components/ui/data-state";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Deterministic bar heights so the chart placeholder never reshuffles between
 * rerenders, while still reading as a real series.
 */
const BAR_HEIGHTS = [
  34, 58, 44, 72, 51, 86, 63, 38, 69, 55, 91, 47, 66, 53, 80, 61, 42, 74, 57, 88,
];

type DashboardSkeletonProps = {
  label?: string;
};

/**
 * Holds the dashboard's real geometry while `/dashboard` loads: the four stat
 * cards, both wide charts, the roster, condition bars, care-mix donut, range
 * highlights, and the month calendar. It uses the same grid wrappers as the
 * loaded screen so nothing shifts when the data lands.
 */
export function DashboardSkeleton({ label = "Loading dashboard" }: DashboardSkeletonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), DATA_LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div aria-busy="true" className="dashboard-stack" role="status">
      <span className="sr-only">{label}</span>

      <div className="stat-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card-wide">
          <ChartCardSkeleton frameHeight="h-70" />
        </div>

        <RosterCardSkeleton />

        <div className="dashboard-card-wide">
          <ChartCardSkeleton frameHeight="h-60" />
        </div>

        <ConditionCardSkeleton />
        <CareMixSkeleton />
        <HighlightsSkeleton />

        <div className="dashboard-card-month">
          <MonthSkeleton />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <article className="stat-card" data-skeleton-stat="">
      <div className="stat-card-top">
        <Skeleton className="size-9.5 rounded-xl" />
        <Skeleton className="h-4.5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="mt-2 h-8 w-24" />
      <div className="stat-card-foot">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </article>
  );
}

function HeadingSkeleton({ badge = false }: { badge?: boolean }) {
  return (
    <div className="card-heading">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-44" />
      </div>
      {badge ? <Skeleton className="h-6 w-20 rounded-full" /> : null}
    </div>
  );
}

type ChartCardSkeletonProps = {
  /** Height utility for the plot area, matching the real chart. */
  frameHeight: string;
};

function ChartCardSkeleton({ frameHeight }: ChartCardSkeletonProps) {
  return (
    <section className="portal-card chart-card" data-skeleton-card="" data-skeleton-variant="chart">
      <div className="card-heading">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>

      <div className="chart-frame">
        <div
          className={`flex w-full items-end gap-1.5 border-b border-line pb-1.5 ${frameHeight}`}
          data-skeleton-chart=""
        >
          {Array.from({ length: 22 }, (_, index) => (
            <Skeleton
              className="flex-1 rounded-t-[5px] rounded-b-none"
              key={index}
              style={{ height: `${BAR_HEIGHTS[index % BAR_HEIGHTS.length]}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RosterCardSkeleton() {
  return (
    <section className="portal-card" data-skeleton-card="" data-skeleton-variant="roster">
      <HeadingSkeleton />

      <ul className="roster-list">
        {Array.from({ length: 5 }, (_, index) => (
          <li className="roster-row" data-skeleton-roster-row="" key={index}>
            <Skeleton className="size-9.5 flex-none rounded-xl" />
            <div className="roster-main flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-2/3" />
              <Skeleton className="h-2 w-1/3" />
              <Skeleton className="mt-1 h-1 w-full rounded-full" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-2 w-10" />
            </div>
          </li>
        ))}
      </ul>

      <div className="roster-summary">
        <Skeleton className="h-2.5 w-40" />
        <Skeleton className="h-2.5 w-28" />
      </div>
    </section>
  );
}

function ConditionCardSkeleton() {
  return (
    <section className="portal-card" data-skeleton-card="" data-skeleton-variant="conditions">
      <HeadingSkeleton badge />

      <div className="condition-list">
        {Array.from({ length: 6 }, (_, index) => (
          <div data-skeleton-condition-row="" key={index}>
            <div className="condition-row-head">
              <span className="condition-label">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-2.5 w-16" />
              </span>
              <Skeleton className="h-2.5 w-12" />
            </div>
            <Skeleton className="h-1.75 w-full rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CareMixSkeleton() {
  return (
    <section className="portal-card" data-skeleton-card="" data-skeleton-variant="care-mix">
      <HeadingSkeleton badge />

      <div className="care-mix-body">
        <div className="relative mx-auto size-44">
          <Skeleton className="absolute inset-0 m-auto size-36 rounded-full" />
          <span className="absolute inset-0 m-auto size-27 rounded-full bg-sheet" />
        </div>

        <div className="grid gap-2.5">
          {Array.from({ length: 2 }, (_, index) => (
            <div className="flex items-center justify-between gap-3" key={index}>
              <span className="flex items-center gap-2">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-2.5 w-24" />
              </span>
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightsSkeleton() {
  return (
    <section className="portal-card" data-skeleton-card="" data-skeleton-variant="highlights">
      <HeadingSkeleton />

      <div className="highlight-list">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="highlight-row" data-skeleton-highlight-row="" key={index}>
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-24" />
            <span className="col-span-2 mt-1.5">
              <Skeleton className="h-2 w-40" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonthSkeleton() {
  return (
    <section className="portal-card" data-skeleton-card="" data-skeleton-variant="month">
      <HeadingSkeleton badge />

      <div aria-hidden="true" className="calendar-grid">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton className="mx-auto my-1 h-2 w-4" key={`weekday-${index}`} />
        ))}
        {Array.from({ length: 35 }, (_, index) => (
          <Skeleton
            className="h-8 w-full rounded-[10px]"
            data-skeleton-day=""
            key={`day-${index}`}
          />
        ))}
      </div>

      <div className="calendar-legend">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-2.5 w-24" />
      </div>
    </section>
  );
}
