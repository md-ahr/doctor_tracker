import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import {
  dashboardPresetRange,
  dashboardRangeBounds,
  dashboardRangeIssue,
  defaultDashboardRange,
  formatChartDate,
  inclusiveDayCount,
  isDateOrderValid,
  parsePlainDate,
  toPlainDate,
} from "@/lib/time/calendar";

test("rejects a range whose start is after its end", () => {
  expect(isDateOrderValid("2026-11-18", "2026-11-01")).toBe(false);
  expect(isDateOrderValid("2026-11-01", "2026-11-18")).toBe(true);
  expect(isDateOrderValid("2026-11-18", "2026-11-18")).toBe(true);
});

test("returns the last 30 inclusive calendar days as date strings", () => {
  const range = defaultDashboardRange("UTC", parsePlainDate("2026-11-18"));

  expect(range).toEqual({ from: "2026-10-20", to: "2026-11-18" });
  expect(formatChartDate(range.from)).toBe("20 Oct");
});

test("builds inclusive preset windows without exceeding the API cap", () => {
  const today = parsePlainDate("2026-11-18");

  expect(dashboardPresetRange("last-7-days", "UTC", today)).toEqual({
    from: "2026-11-12",
    to: "2026-11-18",
  });
  expect(dashboardPresetRange("last-30-days", "UTC", today)).toEqual({
    from: "2026-10-20",
    to: "2026-11-18",
  });
  expect(dashboardPresetRange("last-1-year", "UTC", today)).toEqual({
    from: "2025-11-18",
    to: "2026-11-18",
  });

  const leap = parsePlainDate("2024-02-29");
  const leapRange = dashboardPresetRange("last-1-year", "UTC", leap);
  expect(inclusiveDayCount(leapRange.from, leapRange.to)).toBeLessThanOrEqual(366);
});

test("bounds the dashboard calendar to the last 366 inclusive days", () => {
  expect(dashboardRangeBounds("UTC", parsePlainDate("2026-11-18"))).toEqual({
    min: "2025-11-18",
    max: "2026-11-18",
  });
  expect(inclusiveDayCount("2026-11-18", "2026-11-18")).toBe(1);
});

test("reports why a dashboard window would be rejected", () => {
  expect(dashboardRangeIssue("2025-11-18", "2026-11-18")).toBeNull();
  expect(dashboardRangeIssue("2025-11-17", "2026-11-18")).toBe("too-long");
  expect(dashboardRangeIssue("2026-11-18", "2026-11-01")).toBe("reversed");
  expect(dashboardRangeIssue("", "2026-11-18")).toBeNull();
  expect(dashboardRangeIssue("2026-11-01", "")).toBeNull();
});

test("keeps a plain date and reads an instant as a UTC calendar day", () => {
  expect(toPlainDate("2026-11-18")).toBe("2026-11-18");
  expect(toPlainDate("2026-11-18T02:30:00.000Z")).toBe("2026-11-18");
  expect(toPlainDate("2026-11-18T02:00:00+06:00")).toBe("2026-11-17");
});

test("does not parse chart keys with the Date constructor", () => {
  const source = readFileSync(join(process.cwd(), "src/lib/time/calendar.ts"), "utf8");

  expect(source).not.toContain("new Date(");
});
