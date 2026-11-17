"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import {
  CHART_COLORS,
  conditionsInChartOrder,
  type DashboardConditionCount,
} from "@/features/dashboard/model/dashboard";
import { ChartBlock, chartTooltipStyle } from "@/features/dashboard/ui/chart-block";

type PatientsByConditionChartProps = {
  conditions: DashboardConditionCount[];
};

export function PatientsByConditionChart({ conditions }: PatientsByConditionChartProps) {
  const rows = conditionsInChartOrder(conditions);

  return (
    <ChartBlock caption="All active patients, in fixed condition order." title="By condition">
      {(width) => (
        <BarChart
          data={rows}
          height={280}
          layout="vertical"
          margin={{ top: 8, right: 32, left: 8, bottom: 0 }}
          width={Math.max(width, 280)}
        >
          <CartesianGrid horizontal stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: CHART_COLORS.patientsPerDoctor, fontSize: 12 }}
            tickLine={false}
            type="category"
            width={108}
          />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [value, "Patients"]} />
          <Bar dataKey="patientCount" radius={[0, 2, 2, 0]}>
            {rows.map((row) => (
              <Cell fill={row.ink} key={row.condition} />
            ))}
            <LabelList
              dataKey="patientCount"
              fill={CHART_COLORS.patientsPerDoctor}
              fontSize={12}
              position="right"
            />
          </Bar>
        </BarChart>
      )}
    </ChartBlock>
  );
}
