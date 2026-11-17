"use client";

import { Line } from "recharts";

import { CHART_COLORS } from "@/features/dashboard/model/dashboard";

export function DoctorsCreatedChart() {
  return (
    <Line
      dataKey="doctors"
      dot={{ r: 3, fill: CHART_COLORS.doctorsCreated }}
      name="Doctors created"
      stroke={CHART_COLORS.doctorsCreated}
      strokeWidth={2}
      type="monotone"
    />
  );
}
