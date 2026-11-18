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

export interface DashboardSpecializationCount {
  specialization: string;
  patientCount: number;
  doctorCount: number;
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
  critical: { label: "Critical", ink: "#8e2f2a", wash: "#f8e8e6" },
  serious: { label: "Serious", ink: "#8a4b12", wash: "#f8eedf" },
  observation: { label: "Observation", ink: "#2c4a6e", wash: "#e6edf5" },
  stable: { label: "Stable", ink: "#145c4a", wash: "#e5f2ed" },
  recovering: { label: "Recovering", ink: "#3e5a14", wash: "#eef3e0" },
  chronic: { label: "Chronic", ink: "#5c3d55", wash: "#f3eaf0" },
};

export const CHART_COLORS = {
  patientsPerDoctor: "#1a2332",
  patientsRegistered: "#1b6b56",
  doctorsCreated: "#2c4a6e",
  axis: "#6a6258",
  grid: "#e4ddd2",
  specialization: "#3e4a5c",
  quiet: "#145c4a",
  watched: "#8e2f2a",
} as const;

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value);
}

export function sumCounts(points: DashboardDayPoint[]): number {
  return points.reduce((total, point) => total + point.count, 0);
}

export function seriesIsEmpty(points: DashboardDayPoint[]): boolean {
  return points.every((point) => point.count === 0);
}

/** Trailing moving average, one point per day, including partial leading windows. */
export function movingAverage(points: DashboardDayPoint[], window = 7): DashboardDayPoint[] {
  const size = Math.max(1, Math.floor(window));
  return points.map((point, index) => {
    const slice = points.slice(Math.max(0, index - size + 1), index + 1);
    const total = slice.reduce((sum, entry) => sum + entry.count, 0);
    return { date: point.date, count: Math.round((total / slice.length) * 10) / 10 };
  });
}

/** The highest-count day, or null when every day is zero. Ties keep the earliest day. */
export function busiestDay(points: DashboardDayPoint[]): DashboardDayPoint | null {
  const busiest = points.reduce<DashboardDayPoint | null>(
    (best, point) => (best === null || point.count > best.count ? point : best),
    null,
  );
  return busiest && busiest.count > 0 ? busiest : null;
}

export function daysWithRegistrations(points: DashboardDayPoint[]): number {
  return points.filter((point) => point.count > 0).length;
}

export function averagePerDay(points: DashboardDayPoint[]): number {
  if (points.length === 0) return 0;
  return Math.round((sumCounts(points) / points.length) * 10) / 10;
}

export function doctorsWithPatients(doctors: DashboardDoctorCount[]): number {
  return doctors.filter((doctor) => doctor.patientCount > 0).length;
}

export function averagePatientsPerDoctor(doctors: DashboardDoctorCount[]): number {
  if (doctors.length === 0) return 0;
  const total = doctors.reduce((sum, doctor) => sum + doctor.patientCount, 0);
  return Math.round((total / doctors.length) * 10) / 10;
}

export function patientsBySpecialization(
  doctors: DashboardDoctorCount[],
): DashboardSpecializationCount[] {
  const groups = new Map<string, { patientCount: number; doctorCount: number }>();
  for (const doctor of doctors) {
    const specialization = doctor.specialization.trim() || "Unspecified";
    const group = groups.get(specialization) ?? { patientCount: 0, doctorCount: 0 };
    group.patientCount += doctor.patientCount;
    group.doctorCount += 1;
    groups.set(specialization, group);
  }
  return [...groups.entries()]
    .map(([specialization, group]) => ({ specialization, ...group }))
    .sort(
      (left, right) =>
        right.patientCount - left.patientCount ||
        left.specialization.localeCompare(right.specialization),
    );
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
