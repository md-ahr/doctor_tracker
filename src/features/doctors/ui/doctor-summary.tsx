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
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>{record.name}</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {record.specialization} · {record.hospital}
          </p>
        </div>
        <DoctorFormDialog doctor={record} />
      </header>
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold text-ink-secondary">Phone</dt>
          <dd>{record.phone}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-secondary">Email</dt>
          <dd>{record.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-secondary">Patients</dt>
          <dd>{record.activePatientCount}</dd>
        </div>
      </dl>
    </section>
  );
}
