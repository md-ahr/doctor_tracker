"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis } from "recharts";

import { DataEmpty } from "@/components/ui/data-state";
import {
  CHART_COLORS,
  seriesIsEmpty,
  type DashboardDayPoint,
} from "@/features/dashboard/model/dashboard";
import { ChartBlock, chartAxisTick, chartTooltipStyle } from "@/features/dashboard/ui/chart-block";
import { formatChartDate } from "@/lib/time/calendar";

type RegistrationChartProps = {
  patients: DashboardDayPoint[];
  doctors: DashboardDayPoint[];
};

export function RegistrationChart({ patients, doctors }: RegistrationChartProps) {
  const empty = seriesIsEmpty(patients) && seriesIsEmpty(doctors);
  const doctorCounts = new Map(doctors.map((point) => [point.date, point.count]));
  const rows = patients.map((point) => ({
    date: point.date,
    patients: point.count,
    doctors: doctorCounts.get(point.date) ?? 0,
  }));

  return (
    <ChartBlock
      actions={<SeriesLegend />}
      caption="Patients registered and doctors created, including days with zero."
      title="Over this range"
    >
      {(width) =>
        empty ? (
          <div className="min-h-60">
            <DataEmpty
              guidance="Totals above are unchanged. Widen the range to see earlier days."
              title="Nothing registered in this range"
            />
          </div>
        ) : (
          <LineChart
            data={rows}
            height={252}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            width={Math.max(width, 1)}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 8" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={30}
              tick={chartAxisTick}
              tickFormatter={formatChartDate}
              tickLine={false}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              labelFormatter={(label) => formatChartDate(String(label))}
            />
            <Line
              activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }}
              dataKey="patients"
              dot={false}
              name="Patients registered"
              stroke={CHART_COLORS.patientsRegistered}
              strokeLinecap="round"
              strokeWidth={2.6}
              type="monotone"
            />
            <Line
              activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }}
              dataKey="doctors"
              dot={false}
              name="Doctors created"
              stroke={CHART_COLORS.doctorsCreated}
              strokeLinecap="round"
              strokeWidth={2.6}
              type="monotone"
            />
          </LineChart>
        )
      }
    </ChartBlock>
  );
}

function SeriesLegend() {
  return (
    <p className="flex flex-wrap gap-3 text-[10.5px] font-semibold text-ink-secondary">
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: CHART_COLORS.patientsRegistered }}
        />
        Patients
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: CHART_COLORS.doctorsCreated }}
        />
        Doctors
      </span>
    </p>
  );
}
