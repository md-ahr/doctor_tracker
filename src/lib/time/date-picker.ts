/**
 * Bridges the Temporal-backed filter values (`YYYY-MM-DD`) with the native
 * `Date` objects used by the calendar popover.
 */

import "@/lib/time/temporal";

/** Converts a canonical plain date into a local calendar day. */
export function toCalendarDate(value: string): Date | undefined {
  if (value.length === 0) return undefined;

  try {
    const plain = Temporal.PlainDate.from(value);
    return new Date(plain.year, plain.month - 1, plain.day);
  } catch {
    return undefined;
  }
}

/** Converts a calendar day back into its canonical plain-date string. */
export function fromCalendarDate(date: Date): string {
  return new Temporal.PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate()).toString();
}

/** Midnight of today in the user's time zone. */
export function todayCalendarDate(): Date {
  const today = Temporal.Now.plainDateISO();
  return new Date(today.year, today.month - 1, today.day);
}

/** Human-readable summary of a plain date, e.g. `18 Nov 2026`. */
export function formatCalendarDate(value: string): string {
  if (value.length === 0) return "";

  try {
    return Temporal.PlainDate.from(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}
