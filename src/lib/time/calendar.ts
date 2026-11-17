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
  return value;
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
