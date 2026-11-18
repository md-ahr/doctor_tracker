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
      badge: "All time",
      icon: "doctors",
      tone: { background: "#eef2ff", color: "#4338ca" },
    },
    patients: {
      eyebrow: "Patients",
      value: data.totals.patients,
      caption: "Active records",
      badge: "All time",
      icon: "patients",
      tone: { background: "#ccfbf1", color: "#0f766e" },
    },
    registered: {
      eyebrow: "Registered",
      value: sumCounts(data.patientsRegisteredByDay),
      caption: "In this range",
      badge: "Range",
      spark: data.patientsRegisteredByDay,
      color: CHART_COLORS.patientsRegistered,
      icon: "registered",
      tone: { background: "#ffe4e6", color: "#be123c" },
    },
    added: {
      eyebrow: "Doctors added",
      value: sumCounts(data.doctorsCreatedByDay),
      caption: "In this range",
      badge: "Range",
      spark: data.doctorsCreatedByDay,
      color: CHART_COLORS.doctorsCreated,
      icon: "added",
      tone: { background: "#fef3c7", color: "#b45309" },
    },
  } as const;

  return (
    <>
      {keys.map((key) => {
        const figure = figures[key];
        return (
          <article className="stat-card" key={key}>
            <div className="stat-card-top">
              <span
                aria-hidden="true"
                className="stat-card-icon"
                style={{ backgroundColor: figure.tone.background, color: figure.tone.color }}
              >
                <StatIcon name={figure.icon} />
              </span>
              <span className="stat-card-badge">{figure.badge}</span>
            </div>
            <p className="stat-card-label">{figure.eyebrow}</p>
            <p className="stat-card-value text-[34px] tabular-nums">{figure.value}</p>
            <div className="stat-card-foot">
              <p className="stat-card-caption">{figure.caption}</p>
              {"spark" in figure ? <Sparkline color={figure.color} points={figure.spark} /> : null}
            </div>
          </article>
        );
      })}
    </>
  );
}

type StatIconName = "doctors" | "patients" | "registered" | "added";

function StatIcon({ name }: { name: StatIconName }) {
  if (name === "doctors") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height="18"
        stroke="currentColor"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
        width="18"
      >
        <rect height="16" rx="3" width="17" x="3.5" y="4" />
        <path d="M8 4V2.8M16 4V2.8M3.5 9h17" />
        <path d="M12 12.5v5M9.5 15h5" />
      </svg>
    );
  }

  if (name === "patients") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height="18"
        stroke="currentColor"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
        width="18"
      >
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20c.5-3.6 2.6-5.4 5.5-5.4s5 1.8 5.5 5.4" />
        <path d="M16 5.4a3 3 0 0 1 0 5.6M17.5 14.8c1.9.6 3 2.4 3.3 5.2" />
      </svg>
    );
  }

  if (name === "registered") {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height="18"
        stroke="currentColor"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
        width="18"
      >
        <rect height="17" rx="3" width="17" x="3.5" y="4" />
        <path d="M8 2.5v3M16 2.5v3M3.5 9.5h17" />
        <path d="M12 12v5M9.5 14.5h5" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="10" cy="8" r="3.2" />
      <path d="M4 20c.5-3.6 2.6-5.4 6-5.4 1.1 0 2 .2 2.8.6" />
      <path d="M18 13v7M14.5 16.5h7" />
    </svg>
  );
}

function Sparkline({ points, color }: { points: DashboardDayPoint[]; color: string }) {
  const width = 78;
  const height = 30;
  const max = Math.max(...points.map((point) => point.count), 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.count / max) * (height - 5) - 3;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <svg aria-hidden="true" height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {points.length > 1 ? (
        <path d={`${path} L${width} ${height} L0 ${height} Z`} fill={`url(#${gradientId})`} />
      ) : null}
      <path
        d={path || `M0 ${height} L${width} ${height}`}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}
