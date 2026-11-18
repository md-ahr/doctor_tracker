"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { DataEmpty } from "@/components/ui/data-state";
import {
  CHART_COLORS,
  type DashboardConditionCount,
  type PatientCondition,
} from "@/features/dashboard/model/dashboard";
import { chartTooltipStyle } from "@/features/dashboard/ui/chart-block";

type CareMixProps = {
  conditions: DashboardConditionCount[];
};

const quietConditions: PatientCondition[] = ["stable", "recovering"];
const watchedConditions: PatientCondition[] = ["critical", "serious", "observation", "chronic"];

export function CareMix({ conditions }: CareMixProps) {
  const counts = new Map(conditions.map((row) => [row.condition, row.patientCount]));
  const total = conditions.reduce((sum, row) => sum + row.patientCount, 0);
  const quiet = quietConditions.reduce((sum, condition) => sum + (counts.get(condition) ?? 0), 0);
  const watched = watchedConditions.reduce(
    (sum, condition) => sum + (counts.get(condition) ?? 0),
    0,
  );

  const groups = [
    {
      key: "quiet",
      label: "Stable & recovering",
      value: quiet,
      ink: CHART_COLORS.quiet,
    },
    {
      key: "watched",
      label: "Critical & watch",
      value: watched,
      ink: CHART_COLORS.watched,
    },
  ];
  const chartData = groups.map((group) => ({ name: group.label, value: group.value }));

  return (
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>Care mix</h2>
          <p>All active patients by care group.</p>
        </div>
        <span className="card-count">{total} patients</span>
      </div>

      {total === 0 ? (
        <DataEmpty
          guidance="Patients appear here as soon as the directory has active records."
          title="No patients yet"
        />
      ) : (
        <>
          <div className="relative mx-auto mt-4 grid size-44 place-items-center">
            <PieChart height={176} width={176}>
              <Pie
                cornerRadius={8}
                data={chartData}
                dataKey="value"
                endAngle={-270}
                innerRadius={54}
                nameKey="name"
                outerRadius={72}
                paddingAngle={4}
                startAngle={90}
                stroke="none"
              >
                {groups.map((group) => (
                  <Cell fill={group.ink} key={group.key} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value) => [value, "Patients"]}
              />
            </PieChart>
            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <p className="font-serif text-[30px] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums">
                {total}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-ink-tertiary">patients</p>
            </div>
          </div>

          <dl className="mt-4 grid gap-2.5">
            {groups.map((group) => (
              <div className="flex items-center justify-between gap-3" key={group.key}>
                <dt className="flex items-center gap-2 text-[11.5px] font-medium text-ink-secondary">
                  <span
                    aria-hidden="true"
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: group.ink }}
                  />
                  {group.label}
                </dt>
                <dd className="text-[11.5px] font-bold text-ink tabular-nums">
                  {group.value} · {Math.round((group.value / total) * 100)}%
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
