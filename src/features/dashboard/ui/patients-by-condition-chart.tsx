"use client";

import {
  conditionsInChartOrder,
  formatCount,
  sharePercent,
  type DashboardConditionCount,
} from "@/features/dashboard/model/dashboard";

type PatientsByConditionChartProps = {
  conditions: DashboardConditionCount[];
};

export function PatientsByConditionChart({ conditions }: PatientsByConditionChartProps) {
  const rows = conditionsInChartOrder(conditions);
  const total = rows.reduce((sum, row) => sum + row.patientCount, 0);

  return (
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>By condition</h2>
          <p>All active patients, in fixed condition order.</p>
        </div>
        <span className="card-count">{formatCount(total)} patients</span>
      </div>

      <div className="condition-list">
        {rows.map((row) => {
          const share = sharePercent(row.patientCount, total);

          return (
            <div key={row.condition}>
              <div className="condition-row-head">
                <span className="condition-label">
                  <span
                    aria-hidden="true"
                    className="condition-dot"
                    style={{ backgroundColor: row.ink }}
                  />
                  {row.label}
                </span>
                <span className="condition-count">
                  {formatCount(row.patientCount)} <span>· {share}%</span>
                </span>
              </div>
              <div className="condition-track">
                <span
                  className="condition-fill"
                  style={{
                    backgroundColor: row.ink,
                    width: `${share}%`,
                    opacity: row.patientCount === 0 ? 0 : 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
