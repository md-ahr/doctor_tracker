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

export const CONDITION_INKS: Record<PatientCondition, { label: string; ink: string }> = {
  critical: { label: "Critical", ink: "#8E2F2A" },
  serious: { label: "Serious", ink: "#8A4B12" },
  observation: { label: "Observation", ink: "#2C4A6E" },
  stable: { label: "Stable", ink: "#145C4A" },
  recovering: { label: "Recovering", ink: "#3E5A14" },
  chronic: { label: "Chronic", ink: "#5C3D55" },
};

export const CHART_COLORS = {
  patientsPerDoctor: "#1A2332",
  patientsRegistered: "#1B6B56",
  doctorsCreated: "#2C4A6E",
  axis: "#6A6258",
  grid: "#E4DDD2",
  specialization: "#3E4A5C",
} as const;

export function sumCounts(points: DashboardDayPoint[]): number {
  return points.reduce((total, point) => total + point.count, 0);
}

export function seriesIsEmpty(points: DashboardDayPoint[]): boolean {
  return points.every((point) => point.count === 0);
}

export function conditionsInChartOrder(
  rows: DashboardConditionCount[],
): Array<DashboardConditionCount & { label: string; ink: string }> {
  const counts = new Map(rows.map((row) => [row.condition, row.patientCount]));
  return CONDITION_CHART_ORDER.map((condition) => ({
    condition,
    patientCount: counts.get(condition) ?? 0,
    label: CONDITION_INKS[condition].label,
    ink: CONDITION_INKS[condition].ink,
  }));
}
