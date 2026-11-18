import "@/lib/time/temporal";

export function parsePlainDate(value: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(value);
}

export function toPlainDate(value: string): string {
  if (!value.includes("T")) return value;
  return Temporal.Instant.from(value).toZonedDateTimeISO("UTC").toPlainDate().toString();
}

export function isDateOrderValid(from: string, to: string): boolean {
  return Temporal.PlainDate.compare(parsePlainDate(from), parsePlainDate(to)) <= 0;
}

/** True for an empty value or a canonical `YYYY-MM-DD` calendar day. */
export function isPlainDate(value: string): boolean {
  if (value.length === 0) return true;
  try {
    return Temporal.PlainDate.from(value).toString() === value;
  } catch {
    return false;
  }
}

export function formatChartDate(value: string): string {
  try {
    const date = Temporal.PlainDate.from(value);
    return `${date.day} ${date.toLocaleString("en-GB", { month: "short" })}`;
  } catch {
    return value;
  }
}

export function formatWeekday(value: string): string {
  try {
    return Temporal.PlainDate.from(value).toLocaleString("en-GB", { weekday: "long" });
  } catch {
    return value;
  }
}

export function formatMonthShort(value: string): string {
  try {
    return Temporal.PlainDate.from(value).toLocaleString("en-GB", { month: "short" });
  } catch {
    return value;
  }
}

export type DashboardRange = { from: string; to: string };

export type DashboardRangePreset = "last-7-days" | "last-30-days" | "last-1-year";

/**
 * The API rejects a dashboard window wider than this many inclusive days. The
 * same number bounds every date the dashboard calendar offers, so a picked
 * window can never be wider than the server accepts.
 */
export const DASHBOARD_MAX_RANGE_DAYS = 366;

export type DashboardRangeBounds = { min: string; max: string };

/** Oldest and newest calendar day a dashboard window may use, in `timeZone`. */
export function dashboardRangeBounds(
  timeZone: string,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO(timeZone),
): DashboardRangeBounds {
  return {
    min: today.subtract({ days: DASHBOARD_MAX_RANGE_DAYS - 1 }).toString(),
    max: today.toString(),
  };
}

/** Inclusive day count, so a single day is one and Monday to Monday is seven. */
export function inclusiveDayCount(from: string, to: string): number {
  return parsePlainDate(from).until(parsePlainDate(to), { largestUnit: "day" }).days + 1;
}

export type DashboardRangeIssue = "reversed" | "too-long";

/**
 * `null` when both ends are empty or when the window is one the API accepts.
 * Callers use this before committing, so an invalid window never reaches the query.
 */
export function dashboardRangeIssue(from: string, to: string): DashboardRangeIssue | null {
  if (from.length === 0 || to.length === 0) return null;
  if (!isPlainDate(from) || !isPlainDate(to)) return null;
  if (!isDateOrderValid(from, to)) return "reversed";
  return inclusiveDayCount(from, to) > DASHBOARD_MAX_RANGE_DAYS ? "too-long" : null;
}

/** Inclusive window ending today in `timeZone`, never wider than the API cap. */
export function dashboardPresetRange(
  preset: DashboardRangePreset,
  timeZone: string,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO(timeZone),
): DashboardRange {
  const days =
    preset === "last-7-days" ? 7 : preset === "last-30-days" ? 30 : DASHBOARD_MAX_RANGE_DAYS;

  return {
    from: today.subtract({ days: days - 1 }).toString(),
    to: today.toString(),
  };
}

export function defaultDashboardRange(
  timeZone: string,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO(timeZone),
): DashboardRange {
  return dashboardPresetRange("last-30-days", timeZone, today);
}
