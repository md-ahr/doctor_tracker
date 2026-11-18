"use client";

import { useState } from "react";

import { Cell, Pie, PieChart } from "recharts";

import { DataEmpty } from "@/components/ui/data-state";
import {
  CHART_COLORS,
  formatCount,
  sharePercent,
  type DashboardConditionCount,
  type PatientCondition,
} from "@/features/dashboard/model/dashboard";

type CareMixProps = {
  conditions: DashboardConditionCount[];
};

const quietConditions: PatientCondition[] = ["stable", "recovering"];
const watchedConditions: PatientCondition[] = ["critical", "serious", "observation", "chronic"];

export function CareMix({ conditions }: CareMixProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
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
  const activeGroup = groups.find((group) => group.key === activeKey) ?? null;
  const center = activeGroup
    ? { value: formatCount(activeGroup.value), caption: activeGroup.label }
    : { value: formatCount(total), caption: "patients" };

  return (
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>Care mix</h2>
          <p>All active patients by care group.</p>
        </div>
        <span className="card-count">{formatCount(total)} patients</span>
      </div>

      {total === 0 ? (
        <DataEmpty
          guidance="Patients appear here as soon as the directory has active records."
          title="No patients yet"
        />
      ) : (
        <div className="care-mix-body">
          <div
            className="relative mx-auto grid size-44 place-items-center"
            onMouseLeave={() => setActiveKey(null)}
          >
            <PieChart height={176} width={176}>
              <Pie
                cornerRadius={8}
                data={chartData}
                dataKey="value"
                endAngle={-270}
                innerRadius={54}
                nameKey="name"
                onMouseEnter={(_, index) => setActiveKey(groups[index]?.key ?? null)}
                outerRadius={72}
                paddingAngle={4}
                startAngle={90}
                stroke="none"
              >
                {groups.map((group) => (
                  <Cell fill={group.ink} key={group.key} />
                ))}
              </Pie>
            </PieChart>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid place-content-center text-center"
            >
              <p className="font-serif text-[30px] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums">
                {center.value}
              </p>
              <p className="mx-auto mt-1 w-21 text-[9.5px] leading-[1.15] font-semibold text-balance text-ink-tertiary">
                {center.caption}
              </p>
            </div>
          </div>

          <dl className="grid gap-2.5">
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
                  {formatCount(group.value)} · {sharePercent(group.value, total)}%
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
