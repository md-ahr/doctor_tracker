import { describe, expect, test } from "vitest";

import {
  averagePatientsPerDoctor,
  averagePerDay,
  busiestDay,
  conditionsInChartOrder,
  daysWithRegistrations,
  doctorsWithPatients,
  movingAverage,
  patientsBySpecialization,
  type DashboardDayPoint,
  type DashboardDoctorCount,
} from "@/features/dashboard/model/dashboard";

const days: DashboardDayPoint[] = [
  { date: "2026-11-01", count: 0 },
  { date: "2026-11-02", count: 2 },
  { date: "2026-11-03", count: 4 },
  { date: "2026-11-04", count: 0 },
  { date: "2026-11-05", count: 2 },
];

const doctors: DashboardDoctorCount[] = [
  {
    doctorId: "doc-1",
    name: "Amelia Rahman",
    specialization: "Cardiology",
    patientCount: 6,
  },
  {
    doctorId: "doc-2",
    name: "Bilal Khan",
    specialization: "Cardiology",
    patientCount: 4,
  },
  {
    doctorId: "doc-3",
    name: "Chitra Das",
    specialization: "Neurology",
    patientCount: 0,
  },
];

describe("movingAverage", () => {
  test("smooths each day over the trailing window", () => {
    expect(movingAverage(days, 2).map((point) => point.count)).toEqual([0, 1, 3, 2, 1]);
  });

  test("holds the full window when the series is long enough", () => {
    expect(movingAverage(days, 3)[2]).toEqual({ date: "2026-11-03", count: 2 });
  });
});

describe("range summaries", () => {
  test("finds the busiest day and ignores an all-zero series", () => {
    expect(busiestDay(days)).toEqual({ date: "2026-11-03", count: 4 });
    expect(busiestDay(days.map((point) => ({ ...point, count: 0 })))).toBeNull();
  });

  test("counts active days and the daily average", () => {
    expect(daysWithRegistrations(days)).toBe(3);
    expect(averagePerDay(days)).toBe(1.6);
    expect(averagePerDay([])).toBe(0);
  });
});

describe("doctor load", () => {
  test("counts doctors that carry patients and the roster average", () => {
    expect(doctorsWithPatients(doctors)).toBe(2);
    expect(averagePatientsPerDoctor(doctors)).toBe(3.3);
    expect(averagePatientsPerDoctor([])).toBe(0);
  });

  test("groups patient load by specialization, highest first", () => {
    expect(patientsBySpecialization(doctors)).toEqual([
      { specialization: "Cardiology", patientCount: 10, doctorCount: 2 },
      { specialization: "Neurology", patientCount: 0, doctorCount: 1 },
    ]);
  });
});

test("condition rows keep the fixed acute-to-long-term order with zero fill", () => {
  const rows = conditionsInChartOrder([{ condition: "stable", patientCount: 5 }]);
  expect(rows.map((row) => row.condition)).toEqual([
    "critical",
    "serious",
    "observation",
    "stable",
    "recovering",
    "chronic",
  ]);
  expect(rows.find((row) => row.condition === "stable")?.patientCount).toBe(5);
  expect(rows.find((row) => row.condition === "critical")?.patientCount).toBe(0);
});
