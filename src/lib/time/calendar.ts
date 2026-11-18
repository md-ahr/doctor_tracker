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

export function defaultDashboardRange(
  timeZone: string,
  today: Temporal.PlainDate = Temporal.Now.plainDateISO(timeZone),
): { from: string; to: string } {
  return {
    from: today.subtract({ days: 29 }).toString(),
    to: today.toString(),
  };
}
