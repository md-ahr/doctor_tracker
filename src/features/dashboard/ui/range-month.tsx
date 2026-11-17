"use client";

import { parsePlainDate } from "@/lib/time/calendar";

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type RangeMonthProps = {
  from: string;
  to: string;
};

export function RangeMonth({ from, to }: RangeMonthProps) {
  const start = parsePlainDate(from);
  const end = parsePlainDate(to);
  const monthStart = Temporal.PlainDate.from({ year: end.year, month: end.month, day: 1 });
  const lead = monthStart.dayOfWeek - 1;
  const days = Array.from({ length: monthStart.daysInMonth }, (_, index) =>
    monthStart.add({ days: index }),
  );

  return (
    <section className="rounded-(--radius-sheet) border border-line bg-sheet p-4">
      <h2>{monthStart.toLocaleString("en-GB", { month: "long", year: "numeric" })}</h2>
      <p className="mt-1 text-xs text-ink-secondary">
        {windowLabel(start)} – {windowLabel(end)}
      </p>
      <div aria-hidden="true" className="mt-4 grid grid-cols-7 gap-y-2 text-center">
        {weekdays.map((day) => (
          <span className="text-xs text-ink-tertiary" key={day}>
            {day}
          </span>
        ))}
        {Array.from({ length: lead }, (_, index) => (
          <span key={`pad-${index}`} />
        ))}
        {days.map((day) => {
          const inside =
            Temporal.PlainDate.compare(day, start) >= 0 &&
            Temporal.PlainDate.compare(day, end) <= 0;
          const edge = day.equals(start) || day.equals(end);
          return (
            <span
              className={
                edge
                  ? "mx-auto grid size-7 place-items-center rounded-full bg-action text-[14px] text-action-fg tabular-nums"
                  : inside
                    ? "grid h-7 place-items-center bg-selected text-[14px] text-ink tabular-nums"
                    : "grid h-7 place-items-center text-[14px] text-ink tabular-nums"
              }
              key={day.toString()}
            >
              {day.day}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function windowLabel(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
