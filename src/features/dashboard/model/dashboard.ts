import type { Dashboard as ApiDashboard } from "@/lib/api/dashboard-types";

export type PatientCondition =
  "critical" | "serious" | "stable" | "recovering" | "chronic" | "observation";

export interface DashboardDayPoint {
  date: string;
  count: number;
}

export interface DashboardDoctorCount {
  doctorId: string;
  name: string;
  specialization: string;
  patientCount: number;
}

export interface DashboardConditionCount {
  condition: PatientCondition;
  patientCount: number;
}

export interface Dashboard {
  range: { from: string; to: string; timezone: string };
  totals: { doctors: number; patients: number };
  patientsPerDoctor: DashboardDoctorCount[];
  patientsByCondition: DashboardConditionCount[];
  patientsRegisteredByDay: DashboardDayPoint[];
  doctorsCreatedByDay: DashboardDayPoint[];
}

type Equal<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type AssertMatch = Equal<Dashboard, ApiDashboard>;
const dashboardMatchesApi = true as AssertMatch;
void dashboardMatchesApi;

export const CONDITION_CHART_ORDER = [
  "critical",
  "serious",
  "observation",
  "stable",
  "recovering",
  "chronic",
] as const satisfies readonly PatientCondition[];

export const CONDITION_INKS: Record<
  PatientCondition,
  { label: string; ink: string; wash: string }
> = {
  critical: { label: "Critical", ink: "#be123c", wash: "#ffe4e6" },
  serious: { label: "Serious", ink: "#b45309", wash: "#fef3c7" },
  observation: { label: "Observation", ink: "#4338ca", wash: "#eef2ff" },
  stable: { label: "Stable", ink: "#0f766e", wash: "#ccfbf1" },
  recovering: { label: "Recovering", ink: "#15803d", wash: "#dcfce7" },
  chronic: { label: "Chronic", ink: "#6d28d9", wash: "#f3e8ff" },
};

export const CHART_COLORS = {
  patientsPerDoctor: "#0f172a",
  patientsRegistered: "#4f46e5",
  doctorsCreated: "#f43f5e",
  axis: "#94a3b8",
  grid: "#eef2f7",
  specialization: "#64748b",
  quiet: "#0d9488",
  watched: "#f43f5e",
} as const;

export function sumCounts(points: DashboardDayPoint[]): number {
  return points.reduce((total, point) => total + point.count, 0);
}

export function seriesIsEmpty(points: DashboardDayPoint[]): boolean {
  return points.every((point) => point.count === 0);
}

export function conditionsInChartOrder(
  rows: DashboardConditionCount[],
): Array<DashboardConditionCount & { label: string; ink: string; wash: string }> {
  const counts = new Map(rows.map((row) => [row.condition, row.patientCount]));
  return CONDITION_CHART_ORDER.map((condition) => ({
    condition,
    patientCount: counts.get(condition) ?? 0,
    label: CONDITION_INKS[condition].label,
    ink: CONDITION_INKS[condition].ink,
    wash: CONDITION_INKS[condition].wash,
  }));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.slice(0, 1).toUpperCase()).join("") || "?";
}

export function sharePercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
