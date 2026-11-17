"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_COLORS, type DashboardDoctorCount } from "@/features/dashboard/model/dashboard";
import { ChartBlock, chartTooltipStyle } from "@/features/dashboard/ui/chart-block";

type PatientsPerDoctorChartProps = {
  doctors: DashboardDoctorCount[];
};

export function PatientsPerDoctorChart({ doctors }: PatientsPerDoctorChartProps) {
  const height = Math.max(280, doctors.length * 36);
  const caption = `${doctors.length} ${doctors.length === 1 ? "doctor" : "doctors"}. All active patients. Includes doctors with zero.`;

  return (
    <ChartBlock caption={caption} title="Patients per doctor">
      {(width) => (
        <BarChart
          data={doctors}
          height={height}
          layout="vertical"
          margin={{ top: 8, right: 36, left: 8, bottom: 0 }}
          width={Math.max(width, 320)}
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
            dataKey="doctorId"
            tick={(props) => (
              <DoctorTick
                doctors={doctors}
                payload={props.payload}
                x={typeof props.x === "number" ? props.x : undefined}
                y={typeof props.y === "number" ? props.y : undefined}
              />
            )}
            tickLine={false}
            type="category"
            width={148}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(value) => [value, "Patients"]}
            labelFormatter={(doctorId) => {
              const doctor = doctors.find((item) => item.doctorId === doctorId);
              return doctor ? `${doctor.name}, ${doctor.specialization}` : String(doctorId);
            }}
          />
          <Bar dataKey="patientCount" fill={CHART_COLORS.patientsPerDoctor} radius={[0, 2, 2, 0]}>
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

type DoctorTickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string };
  doctors: DashboardDoctorCount[];
};

function DoctorTick({ x = 0, y = 0, payload, doctors }: DoctorTickProps) {
  const doctor = doctors.find((item) => item.doctorId === payload?.value);
  if (!doctor) return <text />;
  return (
    <text fontSize={12} textAnchor="end" x={x} y={y}>
      <tspan fill={CHART_COLORS.patientsPerDoctor}>{doctor.name}</tspan>
      <tspan fill={CHART_COLORS.specialization}>{` ${doctor.specialization}`}</tspan>
    </text>
  );
}
