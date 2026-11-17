import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import {
  defaultDashboardRange,
  formatChartDate,
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
  expect(formatChartDate(range.from)).toBe("2026-10-20");
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
