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
  const windowDays = Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000,
  );

  return (
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>{monthStart.toLocaleString("en-GB", { month: "long", year: "numeric" })}</h2>
          <p>
            {windowLabel(start)} – {windowLabel(end)}
          </p>
        </div>
        <span className="card-count">{windowDays + 1} days</span>
      </div>
      <div aria-hidden="true" className="calendar-grid">
        {weekdays.map((day) => (
          <span className="calendar-weekday" key={day}>
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
              className="calendar-day"
              data-edge={edge ? "true" : undefined}
              data-in-range={inside ? "true" : undefined}
              key={day.toString()}
            >
              {day.day}
            </span>
          );
        })}
      </div>
      <div className="calendar-legend">
        <span>
          <i aria-hidden="true" />
          Range edges
        </span>
        <span>
          <i aria-hidden="true" data-soft="true" />
          Selected days
        </span>
      </div>
    </section>
  );
}

function windowLabel(date: Temporal.PlainDate): string {
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
