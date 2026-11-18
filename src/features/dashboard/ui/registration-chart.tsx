"use client";

import { Area, CartesianGrid, ComposedChart, Tooltip, XAxis, YAxis } from "recharts";

import { DataEmpty } from "@/components/ui/data-state";
import {
  CHART_COLORS,
  seriesIsEmpty,
  type DashboardDayPoint,
} from "@/features/dashboard/model/dashboard";
import { ChartBlock, chartTooltipStyle } from "@/features/dashboard/ui/chart-block";
import { DoctorsCreatedChart } from "@/features/dashboard/ui/doctors-created-chart";
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
      caption="Patients registered and doctors created, including days with zero."
      legend={<SeriesLegend />}
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
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            width={Math.max(width, 320)}
          >
            <CartesianGrid horizontal stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              tickFormatter={formatChartDate}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              labelFormatter={(label) => formatChartDate(String(label))}
            />
            <Area
              dataKey="patients"
              dot={{ r: 3, fill: CHART_COLORS.patientsRegistered }}
              fill={CHART_COLORS.patientsRegistered}
              fillOpacity={0.15}
              name="Patients registered"
              stroke={CHART_COLORS.patientsRegistered}
              type="monotone"
            />
            <DoctorsCreatedChart />
          </ComposedChart>
        )
      }
    </ChartBlock>
  );
}

function SeriesLegend() {
  return (
    <p className="flex flex-wrap gap-4 text-xs text-ink-secondary">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="inline-block size-2 bg-[#1B6B56]" />
        Patients registered
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="inline-block size-2 bg-[#2C4A6E]" />
        Doctors created
      </span>
    </p>
  );
}
