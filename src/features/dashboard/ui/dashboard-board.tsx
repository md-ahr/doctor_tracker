"use client";

import { useState } from "react";

const ranges = ["Last week", "Last month", "This year"] as const;

type RangeLabel = (typeof ranges)[number];

const figures: Record<
  RangeLabel,
  { patients: string; doctors: string; visits: string; delta: string }
> = {
  "Last week": { patients: "+240", doctors: "34", visits: "128", delta: "+23% last week" },
  "Last month": { patients: "+860", doctors: "34", visits: "540", delta: "+11% last month" },
  "This year": { patients: "+2.4k", doctors: "41", visits: "6.1k", delta: "+18% this year" },
};

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const novemberOffset = 6;
const novemberDays = 30;

const visits = [18, 22, 16, 28, 24, 36, 20];
const visitDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const appointments = [
  ["Peter Anderson", "Dr. Theresa Webb", "305", "10:00–11:00 AM", "Waiting", "$170"],
  ["Maria Johnson", "Dr. Albert Flores", "112", "10:00–10:30 AM", "Complete", "$130"],
];

export function DashboardBoard() {
  const [range, setRange] = useState<RangeLabel>("Last week");
  const figure = figures[range];

  return (
    <div className="portal-board">
      <div className="portal-board-main">
        <section className="portal-card" aria-labelledby="general-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 id="general-heading" className="text-[22px]">
                General
              </h1>
              <p className="mt-1 text-xs text-(--portal-muted)">
                Sample figures for the shell. Live counts connect with the dashboard API.
              </p>
            </div>
            <label className="text-sm text-(--portal-muted)">
              <span className="sr-only">Date range</span>
              <select
                className="h-9 rounded-full bg-(--portal-line) px-3 text-sm text-(--portal-ink)"
                onChange={(event) => setRange(event.target.value as RangeLabel)}
                value={range}
              >
                {ranges.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="portal-stats">
            <Stat
              detail={figure.delta}
              label="New patients"
              spark="patients"
              value={figure.patients}
            />
            <Stat
              detail="+2 in the directory"
              label="Doctors"
              spark="doctors"
              value={figure.doctors}
            />
            <Stat detail="View the directory" label="Visits" spark="visits" value={figure.visits} />
          </div>
        </section>

        <section className="portal-card" aria-labelledby="visits-heading">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="visits-heading" className="text-[20px]">
              Patient visits
            </h2>
            <p className="text-sm text-(--portal-muted)">Month</p>
          </div>
          <p className="text-sm text-(--portal-muted)">
            <span className="mr-3 inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-[#7a6cff]" /> Male
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-[#b7f3e4]" /> Female
            </span>
          </p>
          <VisitChart />
        </section>

        <section className="portal-card" aria-labelledby="appointments-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="appointments-heading" className="text-[20px]">
              Appointments
            </h2>
            <p className="text-xs text-(--portal-muted)">Sample rows, not clinic records.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-(--portal-muted)">
                <tr>
                  {["Patient name", "Doctor name", "Room", "Visit time", "Status", "Amount"].map(
                    (heading) => (
                      <th className="pb-3 font-medium" key={heading}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {appointments.map((row) => (
                  <tr className="border-t border-(--portal-line)" key={row[0]}>
                    {row.map((cell, index) => (
                      <td className="py-3" key={`${row[0]}-${index}`}>
                        {index === 4 ? <StatusPill value={cell} /> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="portal-board-side">
        <section className="portal-card" aria-labelledby="calendar-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="calendar-heading" className="text-[20px]">
              Calendar
            </h2>
            <p className="text-sm text-(--portal-muted)">November</p>
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-(--portal-muted)">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
            {Array.from({ length: novemberOffset }, (_, index) => (
              <span key={`pad-${index}`} />
            ))}
            {Array.from({ length: novemberDays }, (_, index) => {
              const day = index + 1;
              const today = day === 18;
              return (
                <span
                  className={
                    today
                      ? "mx-auto grid size-7 place-items-center rounded-full bg-(--portal-violet) text-white"
                      : "grid h-7 place-items-center text-(--portal-ink)"
                  }
                  key={day}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </section>

        <section className="portal-card" aria-labelledby="statistics-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="statistics-heading" className="text-[20px]">
              Visit statistics
            </h2>
            <p className="text-sm text-(--portal-muted)">Weekly</p>
          </div>
          <p className="mb-3 text-2xl font-semibold">370</p>
          <div className="flex h-28 items-end gap-3">
            {visits.map((value, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={visitDays[index]}>
                <div
                  className="w-full rounded-t-md bg-[#d7d4ff]"
                  style={{
                    height: `${value * 2.4}px`,
                    background: index === 5 ? "var(--portal-violet)" : "#ddd9ff",
                  }}
                />
                <span className="text-[10px] text-(--portal-muted)">{visitDays[index]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="portal-card" aria-labelledby="balance-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="balance-heading" className="text-[20px]">
              Balance
            </h2>
            <p className="text-sm text-(--portal-muted)">Today</p>
          </div>
          <div className="mb-4 flex justify-between text-sm">
            <p>
              <span className="block text-(--portal-muted)">Income</span>
              <span className="text-lg font-semibold text-(--portal-mint)">$1200.00</span>
            </p>
            <p className="text-right">
              <span className="block text-(--portal-muted)">Expense</span>
              <span className="text-lg font-semibold text-(--portal-rose)">$900.00</span>
            </p>
          </div>
          <div className="flex justify-center gap-8">
            <Ring color="var(--portal-mint)" label="64%" />
            <Ring color="var(--portal-rose)" label="36%" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  spark,
}: {
  label: string;
  value: string;
  detail: string;
  spark: "patients" | "doctors" | "visits";
}) {
  return (
    <article className="rounded-2xl bg-[#f7f8fd] px-3 py-3">
      <p className="text-xs text-(--portal-muted)">{label}</p>
      <p className="mt-2 text-[28px] leading-none font-semibold tracking-tight">{value}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-[11px] text-(--portal-mint)">{detail}</p>
        <Sparkline tone={spark} />
      </div>
    </article>
  );
}

function Sparkline({ tone }: { tone: "patients" | "doctors" | "visits" }) {
  const color = tone === "patients" ? "#35c48a" : tone === "doctors" ? "#6c4dff" : "#ff7aa2";
  return (
    <svg aria-hidden="true" height="28" viewBox="0 0 72 28" width="72">
      <path
        d="M2 20 C10 18 14 8 22 12 S34 24 42 14 58 6 70 10"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function VisitChart() {
  return (
    <svg
      aria-label="Sample visit trend"
      className="mt-2 h-52 w-full"
      role="img"
      viewBox="0 0 640 220"
    >
      <path
        d="M20 120 C80 150 120 40 180 90 S280 170 340 110 460 40 520 100 600 150 620 90 L620 190 L20 190 Z"
        fill="#ddd8ff"
        opacity="0.85"
      />
      <path
        d="M20 150 C90 120 140 170 210 130 S320 80 390 140 500 170 620 120 L620 190 L20 190 Z"
        fill="#c8f6ea"
        opacity="0.9"
      />
      <text fill="#8d93a8" fontSize="12" x="300" y="78">
        2852
      </text>
      <text fill="#8d93a8" fontSize="11" x="292" y="94">
        17 Sep
      </text>
    </svg>
  );
}

function StatusPill({ value }: { value: string }) {
  const waiting = value === "Waiting";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        waiting ? "bg-[#fff1d6] text-[#c4841d]" : "bg-[#e5f8ef] text-[#1d9a62]"
      }`}
    >
      {value}
    </span>
  );
}

function Ring({ color, label }: { color: string; label: string }) {
  return (
    <div className="relative grid size-24 place-items-center">
      <svg aria-hidden="true" className="absolute inset-0" viewBox="0 0 36 36">
        <circle cx="18" cy="18" fill="none" r="14" stroke="#eef0f6" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          fill="none"
          r="14"
          stroke={color}
          strokeDasharray={`${label === "64%" ? 56 : 32} 88`}
          strokeLinecap="round"
          strokeWidth="4"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
