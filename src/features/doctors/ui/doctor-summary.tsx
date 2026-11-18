"use client";

import { DataError, DataLoading, directoryErrorMessage } from "@/components/ui/data-state";
import { DoctorFormDialog } from "@/features/doctors/ui/doctor-form";
import { useDoctor } from "@/features/doctors/hooks/use-doctor";

type DoctorSummaryProps = {
  doctorId: string;
};

export function DoctorSummary({ doctorId }: DoctorSummaryProps) {
  const doctor = useDoctor(doctorId);

  if (doctor.isLoading) {
    return (
      <section className="portal-card">
        <DataLoading label="Loading doctor" />
      </section>
    );
  }

  if (doctor.isError || !doctor.data) {
    return (
      <section className="portal-card">
        <DataError
          message={directoryErrorMessage(doctor.error)}
          onRetry={() => void doctor.refetch()}
        />
      </section>
    );
  }

  const record = doctor.data;

  return (
    <section className="portal-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-selected text-[20px] font-bold text-action"
          >
            {initials(record.name)}
          </span>
          <div className="min-w-0">
            <h1>{record.name}</h1>
            <p className="page-context">
              {record.specialization} · {record.hospital}
            </p>
          </div>
        </div>
        <div className="page-actions">
          <DoctorFormDialog doctor={record} />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-line pt-5 min-[480px]:grid-cols-3">
        <div>
          <dt className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
            Phone
          </dt>
          <dd className="mt-1 text-[13px] font-medium text-ink">{record.phone}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
            Email
          </dt>
          <dd className="mt-1 truncate text-[13px] font-medium text-ink">{record.email}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
            Active patients
          </dt>
          <dd className="mt-1 text-[13px] font-medium text-ink tabular-nums">
            {record.activePatientCount}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.slice(0, 1).toUpperCase()).join("") || "?";
}
