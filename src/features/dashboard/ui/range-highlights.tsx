"use client";

import { DataEmpty } from "@/components/ui/data-state";
import {
  averagePerDay,
  busiestDay,
  conditionsInChartOrder,
  daysWithRegistrations,
  doctorsWithPatients,
  formatCount,
  formatDecimal,
  patientsBySpecialization,
  sharePercent,
  type DashboardConditionCount,
  type DashboardDayPoint,
  type DashboardDoctorCount,
} from "@/features/dashboard/model/dashboard";
import { formatChartDate } from "@/lib/time/calendar";

type RangeHighlightsProps = {
  patients: DashboardDayPoint[];
  doctors: DashboardDoctorCount[];
  conditions: DashboardConditionCount[];
};

export function RangeHighlights({ patients, doctors, conditions }: RangeHighlightsProps) {
  const peak = busiestDay(patients);
  const activeDays = daysWithRegistrations(patients);
  const dailyAverage = averagePerDay(patients);
  const coveredDoctors = doctorsWithPatients(doctors);
  const specialization = patientsBySpecialization(doctors)[0];
  const conditionRows = conditionsInChartOrder(conditions);
  const totalPatients = conditionRows.reduce((sum, row) => sum + row.patientCount, 0);
  const topCondition = [...conditionRows].sort(
    (left, right) => right.patientCount - left.patientCount,
  )[0];

  const highlights = [
    {
      key: "peak",
      label: "Peak day",
      value: peak ? formatChartDate(peak.date) : "None",
      meta: peak
        ? `${formatCount(peak.count)} ${peak.count === 1 ? "registration" : "registrations"}`
        : "No registrations in this range",
    },
    {
      key: "average",
      label: "Daily average",
      value: formatDecimal(dailyAverage),
      meta: `${formatCount(activeDays)} ${activeDays === 1 ? "active day" : "active days"} in range`,
    },
    {
      key: "coverage",
      label: "Doctor coverage",
      value: `${formatCount(coveredDoctors)} of ${formatCount(doctors.length)}`,
      meta: "Doctors with active patients",
    },
    {
      key: "specialization",
      label: "Busiest specialization",
      value: specialization?.specialization ?? "None",
      meta: specialization
        ? `${formatCount(specialization.patientCount)} patients · ${formatCount(
            specialization.doctorCount,
          )} ${specialization.doctorCount === 1 ? "doctor" : "doctors"}`
        : "No doctors in the directory",
    },
    {
      key: "condition",
      label: "Most common condition",
      value: topCondition?.label ?? "None",
      meta: topCondition
        ? `${formatCount(topCondition.patientCount)} patients · ${sharePercent(
            topCondition.patientCount,
            totalPatients,
          )}%`
        : "No active patients",
    },
  ];

  return (
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>Range at a glance</h2>
          <p>Momentum from the selected range, coverage from all active records.</p>
        </div>
      </div>

      {patients.length === 0 && doctors.length === 0 ? (
        <DataEmpty
          guidance="Add a doctor and a patient to see the range summary."
          title="Nothing to summarise yet"
        />
      ) : (
        <dl className="highlight-list">
          {highlights.map((highlight) => (
            <div className="highlight-row" key={highlight.key}>
              <dt className="highlight-label">{highlight.label}</dt>
              <dd className="highlight-value">{highlight.value}</dd>
              <dd className="highlight-meta">{highlight.meta}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
