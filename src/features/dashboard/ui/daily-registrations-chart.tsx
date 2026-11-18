"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis } from "recharts";

import { DataEmpty } from "@/components/ui/data-state";
import {
  CHART_COLORS,
  seriesIsEmpty,
  sumCounts,
  type DashboardDayPoint,
} from "@/features/dashboard/model/dashboard";
import { ChartBlock, chartAxisTick, chartTooltipStyle } from "@/features/dashboard/ui/chart-block";
import { formatChartDate } from "@/lib/time/calendar";

type DailyRegistrationsChartProps = {
  patients: DashboardDayPoint[];
};

export function DailyRegistrationsChart({ patients }: DailyRegistrationsChartProps) {
  const total = sumCounts(patients);
  const empty = seriesIsEmpty(patients);

  return (
    <ChartBlock
      actions={<span className="card-count">{total} in range</span>}
      caption="Patients registered on each day of the selected range."
      title="Daily registrations"
    >
      {(width) =>
        empty ? (
          <div className="min-h-52">
            <DataEmpty
              guidance="No patient was registered in this window. Pick a wider range."
              title="No registrations yet"
            />
          </div>
        ) : (
          <BarChart
            data={patients}
            height={210}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
            width={Math.max(width, 1)}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 8" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={24}
              tick={chartAxisTick}
              tickFormatter={formatChartDate}
              tickLine={false}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value) => [value, "Patients"]}
              labelFormatter={(label) => formatChartDate(String(label))}
            />
            <Bar
              dataKey="count"
              fill={CHART_COLORS.patientsRegistered}
              maxBarSize={22}
              name="Patients registered"
              radius={[6, 6, 2, 2]}
            />
          </BarChart>
        )
      }
    </ChartBlock>
  );
}
