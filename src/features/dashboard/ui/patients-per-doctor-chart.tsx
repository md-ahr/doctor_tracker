"use client";

import Link from "next/link";

import { DataEmpty } from "@/components/ui/data-state";
import {
  averagePatientsPerDoctor,
  CHART_COLORS,
  doctorsWithPatients,
  formatCount,
  formatDecimal,
  initials,
  sharePercent,
  type DashboardDoctorCount,
} from "@/features/dashboard/model/dashboard";

type PatientsPerDoctorChartProps = {
  doctors: DashboardDoctorCount[];
};

const avatarTones = [
  { background: "#e5f2ed", color: "#145c4a" },
  { background: "#e6edf5", color: "#2c4a6e" },
  { background: "#f8e8e6", color: "#8e2f2a" },
  { background: "#f8eedf", color: "#8a4b12" },
  { background: "#f3eaf0", color: "#5c3d55" },
] as const;

const visibleDoctors = 5;

export function PatientsPerDoctorChart({ doctors }: PatientsPerDoctorChartProps) {
  const ranked = [...doctors].sort(
    (left, right) => right.patientCount - left.patientCount || left.name.localeCompare(right.name),
  );
  const visible = ranked.slice(0, visibleDoctors);
  const max = Math.max(...ranked.map((doctor) => doctor.patientCount), 1);
  const covered = doctorsWithPatients(ranked);
  const average = averagePatientsPerDoctor(ranked);

  return (
    <section className="portal-card">
      <div className="card-heading">
        <div>
          <h2>Patients per doctor</h2>
          <p>
            {formatCount(ranked.length)} {ranked.length === 1 ? "doctor" : "doctors"} · all active
            patients
          </p>
        </div>
        <Link className="text-link" href="/doctors">
          View all
        </Link>
      </div>

      {ranked.length === 0 ? (
        <DataEmpty
          guidance="Add a doctor to see the active patient load."
          title="No doctors in the directory"
        />
      ) : (
        <>
          <ul className="roster-list">
            {visible.map((doctor, index) => {
              const tone = avatarTones[index % avatarTones.length];
              const share = sharePercent(doctor.patientCount, max);

              return (
                <li className="roster-row" key={doctor.doctorId}>
                  <span
                    aria-hidden="true"
                    className="roster-avatar"
                    style={{ backgroundColor: tone.background, color: tone.color }}
                  >
                    {initials(doctor.name)}
                  </span>
                  <div className="roster-main">
                    <p className="roster-name">
                      <Link className="roster-link" href={`/doctors/${doctor.doctorId}`}>
                        {doctor.name}
                      </Link>
                    </p>
                    <p className="roster-meta">{doctor.specialization}</p>
                    <div className="roster-bar">
                      <span
                        style={{
                          backgroundColor: CHART_COLORS.patientsPerDoctor,
                          width: `${share}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="roster-count">
                    <strong>{formatCount(doctor.patientCount)}</strong>
                    <span>patients</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="roster-summary">
            <p>
              {formatCount(covered)} of {formatCount(ranked.length)} doctors have active patients
            </p>
            <p>Average {formatDecimal(average)} patients each</p>
          </div>
        </>
      )}
    </section>
  );
}
