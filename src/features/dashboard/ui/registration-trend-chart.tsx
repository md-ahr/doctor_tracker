"use client";

import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { DataEmpty } from "@/components/ui/data-state";
import {
  CHART_COLORS,
  formatCount,
  formatDecimal,
  movingAverage,
  seriesIsEmpty,
  sumCounts,
  type DashboardDayPoint,
} from "@/features/dashboard/model/dashboard";
import { ChartBlock, chartAxisTick, chartTooltipStyle } from "@/features/dashboard/ui/chart-block";
import { formatChartDate } from "@/lib/time/calendar";

type RegistrationTrendChartProps = {
  patients: DashboardDayPoint[];
};

const averageWindow = 7;

export function RegistrationTrendChart({ patients }: RegistrationTrendChartProps) {
  const total = sumCounts(patients);
  const empty = seriesIsEmpty(patients);
  const average = movingAverage(patients, averageWindow);
  const rows = patients.map((point, index) => ({
    date: point.date,
    count: point.count,
    average: average[index]?.count ?? 0,
  }));

  return (
    <ChartBlock
      actions={
        empty ? undefined : (
          <div className="flex flex-wrap items-center gap-3">
            <TrendLegend />
            <span className="card-count">{formatCount(total)} in range</span>
          </div>
        )
      }
      caption="Patients registered each day, with a trailing 7-day average to show the trend."
      title="Registration trend"
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
          <ComposedChart
            data={rows}
            height={240}
            margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
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
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tick={chartAxisTick}
              tickFormatter={(value) => formatCount(Number(value))}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value, name) => [
                String(name) === "7-day average"
                  ? formatDecimal(Number(value))
                  : formatCount(Number(value)),
                name,
              ]}
              labelFormatter={(label) => formatChartDate(String(label))}
            />
            <Bar
              dataKey="count"
              fill={CHART_COLORS.patientsRegistered}
              maxBarSize={20}
              name="Registered that day"
              radius={[5, 5, 1, 1]}
            />
            <Line
              activeDot={{ r: 3.5, stroke: "#ffffff", strokeWidth: 2 }}
              dataKey="average"
              dot={false}
              name="7-day average"
              stroke={CHART_COLORS.doctorsCreated}
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeWidth={2.2}
              type="monotone"
            />
          </ComposedChart>
        )
      }
    </ChartBlock>
  );
}

function TrendLegend() {
  return (
    <p className="chart-legend">
      <span>
        <i aria-hidden="true" style={{ backgroundColor: CHART_COLORS.patientsRegistered }} />
        Daily
      </span>
      <span>
        <i
          aria-hidden="true"
          data-shape="line"
          style={{ backgroundColor: CHART_COLORS.doctorsCreated }}
        />
        7-day average
      </span>
    </p>
  );
}
