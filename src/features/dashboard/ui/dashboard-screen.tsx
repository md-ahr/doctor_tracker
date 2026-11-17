"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { PatientsByConditionChart } from "@/features/dashboard/ui/patients-by-condition-chart";
import { PatientsPerDoctorChart } from "@/features/dashboard/ui/patients-per-doctor-chart";
import { RangeMonth } from "@/features/dashboard/ui/range-month";
import { RegistrationChart } from "@/features/dashboard/ui/registration-chart";
import { StatTiles } from "@/features/dashboard/ui/stat-tiles";
import { DashboardRangeControl } from "@/features/dashboard/ui/dashboard-range-control";
import { ApiError } from "@/lib/api/types";
import { defaultDashboardRange } from "@/lib/time/calendar";

export function DashboardScreen() {
  const [range, setRange] = useState(() => defaultDashboardRange("UTC"));
  const dashboard = useDashboard(range.from, range.to);
  const data = dashboard.data;

  return (
    <div className="grid items-start gap-6 min-[720px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <header className="min-[720px]:col-start-1">
        <h1>Dashboard</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Counts are all active records. The charts below follow the range.
        </p>
      </header>

      <div className="min-[720px]:col-start-1">
        <DashboardRangeControl
          from={range.from}
          onCommit={setRange}
          timeZone={data?.range.timezone ?? "UTC"}
          to={range.to}
        />
      </div>

      {dashboard.isError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-danger-text/40 bg-danger-wash px-4 py-3 text-sm min-[720px]:col-span-2"
          role="status"
        >
          <p>
            {dashboard.error instanceof ApiError
              ? dashboard.error.message
              : "The directory could not be loaded."}
          </p>
          <Button onClick={() => void dashboard.refetch()} type="button" variant="quiet">
            Try again
          </Button>
        </div>
      ) : null}

      {dashboard.isPending ? (
        <div aria-busy="true" className="flex min-h-70 flex-col gap-3 min-[720px]:col-span-2">
          <p className="sr-only">Loading dashboard</p>
          <span className="h-3 rounded-sm bg-inset" />
          <span className="h-3 rounded-sm bg-inset" />
          <span className="h-3 rounded-sm bg-inset" />
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-4 min-[720px]:col-start-1 min-[720px]:grid-cols-3">
            <StatTiles data={data} keys={["doctors", "patients", "registered"]} />
            <div className="min-[720px]:hidden">
              <StatTiles data={data} keys={["added"]} />
            </div>
          </div>
          <div className="min-[720px]:col-start-1">
            <RegistrationChart
              doctors={data.doctorsCreatedByDay}
              patients={data.patientsRegisteredByDay}
            />
          </div>
          <div className="min-[720px]:col-start-1">
            <PatientsPerDoctorChart doctors={data.patientsPerDoctor} />
          </div>
          <div className="min-[720px]:col-start-2 min-[720px]:row-start-1">
            <RangeMonth from={data.range.from} to={data.range.to} />
          </div>
          <div className="min-[720px]:col-start-2">
            <PatientsByConditionChart conditions={data.patientsByCondition} />
          </div>
          <div className="hidden min-[720px]:col-start-2 min-[720px]:block">
            <StatTiles data={data} keys={["added"]} />
          </div>
        </>
      ) : null}
    </div>
  );
}
