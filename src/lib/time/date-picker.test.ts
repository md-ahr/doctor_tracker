import { expect, test } from "vitest";

import {
  formatCalendarDate,
  fromCalendarDate,
  toCalendarDate,
  todayCalendarDate,
} from "@/lib/time/date-picker";

test("round-trips canonical plain dates through the calendar date object", () => {
  const date = toCalendarDate("2026-11-18");

  expect(date).toBeInstanceOf(Date);
  expect(date?.getFullYear()).toBe(2026);
  expect(date?.getMonth()).toBe(10);
  expect(date?.getDate()).toBe(18);
  expect(fromCalendarDate(date as Date)).toBe("2026-11-18");
});

test("returns undefined for empty or malformed values", () => {
  expect(toCalendarDate("")).toBeUndefined();
  expect(toCalendarDate("18/11/2026")).toBeUndefined();
});

test("formats a plain date for the field and today as a calendar day", () => {
  expect(formatCalendarDate("2026-11-18")).toBe("18 Nov 2026");
  expect(formatCalendarDate("")).toBe("");

  const today = todayCalendarDate();

  expect(fromCalendarDate(today)).toHaveLength(10);
});
