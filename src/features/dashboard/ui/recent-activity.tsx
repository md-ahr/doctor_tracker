"use client";

import { DataEmpty } from "@/components/ui/data-state";
import type { DashboardDayPoint } from "@/features/dashboard/model/dashboard";
import { formatMonthShort, formatWeekday } from "@/lib/time/calendar";

type RecentActivityProps = {
  patients: DashboardDayPoint[];
  doctors: DashboardDayPoint[];
};

const visibleDays = 5;

export function RecentActivity({ patients, doctors }: RecentActivityProps) {
  const doctorCounts = new Map(doctors.map((point) => [point.date, point.count]));
  const rows = patients
    .map((point) => ({
      date: point.date,
      patients: point.count,
      doctors: doctorCounts.get(point.date) ?? 0,
    }))
    .filter((row) => row.patients > 0 || row.doctors > 0)
    .reverse()
    .slice(0, visibleDays);

  return (
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>Recent activity</h2>
          <p>Latest days with registrations in the selected range.</p>
        </div>
        <span className="card-count">{rows.length} days</span>
      </div>

      {rows.length === 0 ? (
        <DataEmpty
          guidance="Registered patients and new doctors will appear here day by day."
          title="No recent activity"
        />
      ) : (
        <ul className="recent-list">
          {rows.map((row) => (
            <li className="recent-row" key={row.date}>
              <span aria-hidden="true" className="recent-date">
                <strong>{Number(row.date.slice(8, 10))}</strong>
                <span>{formatMonthShort(row.date)}</span>
              </span>
              <div className="recent-main">
                <p className="recent-day">{formatWeekday(row.date)}</p>
                <p className="recent-meta">
                  {row.patients} {row.patients === 1 ? "registration" : "registrations"} ·{" "}
                  {row.doctors} {row.doctors === 1 ? "doctor" : "doctors"} added
                </p>
              </div>
              <div className="recent-pills">
                <span className="recent-pill" data-tone="patients">
                  {row.patients} new
                </span>
                {row.doctors > 0 ? (
                  <span className="recent-pill" data-tone="doctors">
                    {row.doctors} added
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
