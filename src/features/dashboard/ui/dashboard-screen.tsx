"use client";

import { useState } from "react";

import { DataError, DataLoading, directoryErrorMessage } from "@/components/ui/data-state";
import { CareMix } from "@/features/dashboard/ui/care-mix";
import { DailyRegistrationsChart } from "@/features/dashboard/ui/daily-registrations-chart";
import { DashboardRangeControl } from "@/features/dashboard/ui/dashboard-range-control";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { PatientsByConditionChart } from "@/features/dashboard/ui/patients-by-condition-chart";
import { PatientsPerDoctorChart } from "@/features/dashboard/ui/patients-per-doctor-chart";
import { RangeMonth } from "@/features/dashboard/ui/range-month";
import { RecentActivity } from "@/features/dashboard/ui/recent-activity";
import { RegistrationChart } from "@/features/dashboard/ui/registration-chart";
import { StatTiles } from "@/features/dashboard/ui/stat-tiles";
import { defaultDashboardRange } from "@/lib/time/calendar";

export function DashboardScreen() {
  const [range, setRange] = useState(() => defaultDashboardRange("UTC"));
  const dashboard = useDashboard(range.from, range.to);
  const data = dashboard.data;

  return (
    <div className="dashboard-stack">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-context">
            Counts are all active records. The charts below follow the range.
          </p>
        </div>
        <div className="page-actions">
          <DashboardRangeControl
            from={range.from}
            onCommit={setRange}
            timeZone={data?.range.timezone ?? "UTC"}
            to={range.to}
          />
        </div>
      </header>

      {dashboard.isError ? (
        <DataError
          message={directoryErrorMessage(dashboard.error)}
          onRetry={() => void dashboard.refetch()}
        />
      ) : null}

      {dashboard.isPending ? <DataLoading className="min-h-70" label="Loading dashboard" /> : null}

      {data ? (
        <>
          <div className="stat-grid">
            <StatTiles data={data} keys={["patients", "doctors", "registered", "added"]} />
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card-wide">
              <RegistrationChart
                doctors={data.doctorsCreatedByDay}
                patients={data.patientsRegisteredByDay}
              />
            </div>

            <PatientsPerDoctorChart doctors={data.patientsPerDoctor} />

            <DailyRegistrationsChart patients={data.patientsRegisteredByDay} />
            <PatientsByConditionChart conditions={data.patientsByCondition} />
            <CareMix conditions={data.patientsByCondition} />

            <div className="dashboard-card-wide">
              <RecentActivity
                doctors={data.doctorsCreatedByDay}
                patients={data.patientsRegisteredByDay}
              />
            </div>
            <div className="dashboard-card-month">
              <RangeMonth from={data.range.from} to={data.range.to} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
