"use client";

import type { Dashboard, DashboardDayPoint } from "@/features/dashboard/model/dashboard";
import { CHART_COLORS, sumCounts } from "@/features/dashboard/model/dashboard";

export type StatKey = "doctors" | "patients" | "registered" | "added";

type StatTilesProps = {
  data: Dashboard;
  keys?: StatKey[];
};

const order: StatKey[] = ["doctors", "patients", "registered", "added"];

export function StatTiles({ data, keys = order }: StatTilesProps) {
  const figures = {
    doctors: {
      eyebrow: "Doctors",
      value: data.totals.doctors,
      caption: "All records",
    },
    patients: {
      eyebrow: "Patients",
      value: data.totals.patients,
      caption: "Active",
    },
    registered: {
      eyebrow: "Registered",
      value: sumCounts(data.patientsRegisteredByDay),
      caption: "In this range",
      spark: data.patientsRegisteredByDay,
      color: CHART_COLORS.patientsRegistered,
    },
    added: {
      eyebrow: "Doctors added",
      value: sumCounts(data.doctorsCreatedByDay),
      caption: "In this range",
      spark: data.doctorsCreatedByDay,
      color: CHART_COLORS.doctorsCreated,
    },
  } as const;

  return (
    <>
      {keys.map((key) => {
        const figure = figures[key];
        return (
          <article
            className="rounded-(--radius-sheet) border border-line bg-sheet px-4 py-4"
            key={key}
          >
            <p className="text-[11px] tracking-[0.06em] text-ink-tertiary uppercase">
              {figure.eyebrow}
            </p>
            <p className="mt-2 font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.02em] text-ink tabular-nums">
              {figure.value}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-xs text-ink-secondary">{figure.caption}</p>
              {"spark" in figure ? <Sparkline color={figure.color} points={figure.spark} /> : null}
            </div>
          </article>
        );
      })}
    </>
  );
}

function Sparkline({ points, color }: { points: DashboardDayPoint[]; color: string }) {
  const width = 72;
  const height = 28;
  const max = Math.max(...points.map((point) => point.count), 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.count / max) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg aria-hidden="true" height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
      <path
        d={path || `M0 ${height} L${width} ${height}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}
