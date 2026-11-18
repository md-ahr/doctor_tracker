"use client";

import { Area, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { DataEmpty } from "@/components/ui/data-state";
import {
  CHART_COLORS,
  formatCount,
  seriesIsEmpty,
  type DashboardDayPoint,
} from "@/features/dashboard/model/dashboard";
import { ChartBlock, chartAxisTick, chartTooltipStyle } from "@/features/dashboard/ui/chart-block";
import { formatChartDate } from "@/lib/time/calendar";

type RegistrationChartProps = {
  patients: DashboardDayPoint[];
  doctors: DashboardDayPoint[];
};

const patientWash = "registration-chart-patients-wash";

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
      actions={empty ? undefined : <SeriesLegend />}
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
          <ComposedChart
            data={rows}
            height={280}
            margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
            width={Math.max(width, 1)}
          >
            <defs>
              <linearGradient id={patientWash} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.patientsRegistered} stopOpacity="0.26" />
                <stop offset="100%" stopColor={CHART_COLORS.patientsRegistered} stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 8" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={30}
              tick={chartAxisTick}
              tickFormatter={formatChartDate}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tick={chartAxisTick}
              tickFormatter={(value) => formatCount(Number(value))}
              tickLine={false}
              width={34}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value, name) => [formatCount(Number(value)), name]}
              labelFormatter={(label) => formatChartDate(String(label))}
            />
            <Area
              activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }}
              dataKey="patients"
              dot={false}
              fill={`url(#${patientWash})`}
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
          </ComposedChart>
        )
      }
    </ChartBlock>
  );
}

function SeriesLegend() {
  return (
    <p className="chart-legend">
      <span>
        <i aria-hidden="true" style={{ backgroundColor: CHART_COLORS.patientsRegistered }} />
        Patients
      </span>
      <span>
        <i aria-hidden="true" style={{ backgroundColor: CHART_COLORS.doctorsCreated }} />
        Doctors
      </span>
    </p>
  );
}
