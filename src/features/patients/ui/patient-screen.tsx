"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useDoctorDirectory, usePatientList } from "@/features/patients/hooks/use-patient-list";
import type { Patient } from "@/features/patients/model/patient";
import {
  patientFilterSchema,
  type PatientFilterValues,
} from "@/features/patients/model/patient-filter-schema";
import { PatientCreateDialog } from "@/features/patients/ui/patient-create-dialog";
import { PatientFilters } from "@/features/patients/ui/patient-filters";
import { PatientFormDialog } from "@/features/patients/ui/patient-form";
import { PatientTable } from "@/features/patients/ui/patient-table";
import { ApiError } from "@/lib/api/types";
import { isDateOrderValid } from "@/lib/time/calendar";

const emptyFilters: PatientFilterValues = {
  q: "",
  condition: "",
  doctorId: "",
  registeredFrom: "",
  registeredTo: "",
};

type PatientScreenProps = {
  doctorId?: string;
  doctorName?: string;
};

export function PatientScreen({ doctorId, doctorName }: PatientScreenProps) {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [filters, setFilters] = useState<PatientFilterValues>(emptyFilters);
  const [applied, setApplied] = useState<PatientFilterValues>(emptyFilters);
  const directory = useDoctorDirectory(doctorId === undefined);

  const datesInvalid =
    filters.registeredFrom.length > 0 &&
    filters.registeredTo.length > 0 &&
    !isDateOrderValid(filters.registeredFrom, filters.registeredTo);

  function onFiltersChange(next: PatientFilterValues) {
    setFilters(next);
    setPage(1);
    const parsed = patientFilterSchema.safeParse(next);
    if (parsed.success) setApplied(parsed.data);
  }

  const query = useMemo(
    () => ({
      q: applied.q || undefined,
      condition: doctorId ? undefined : applied.condition || undefined,
      doctorId: doctorId ?? (applied.doctorId || undefined),
      registeredFrom: doctorId ? undefined : applied.registeredFrom || undefined,
      registeredTo: doctorId ? undefined : applied.registeredTo || undefined,
      page,
      limit: 20 as const,
      sort: "registeredAt" as const,
    }),
    [applied, doctorId, page],
  );

  const list = usePatientList(query);
  const scoped = doctorId !== undefined;
  const filtered = scoped
    ? applied.q.length > 0
    : applied.q.length > 0 ||
      applied.condition.length > 0 ||
      applied.doctorId.length > 0 ||
      applied.registeredFrom.length > 0 ||
      applied.registeredTo.length > 0;
  const total = list.data?.meta.total ?? 0;
  const showEmptyDirectory = list.isSuccess && total === 0 && !filtered;
  const showFilteredEmpty = list.isSuccess && total === 0 && filtered;

  return (
    <section className="portal-card">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {scoped ? <h2>Patients</h2> : <h1>Patients</h1>}
          {scoped ? null : (
            <p className="mt-1 text-sm text-ink-secondary">Active patients across every doctor.</p>
          )}
        </div>
        {doctorId ? (
          <PatientCreateDialog
            doctorId={doctorId}
            doctorName={doctorName}
            onOpenChange={setCreating}
            open={creating}
          />
        ) : null}
      </header>

      {list.isError ? (
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-danger-text/40 bg-danger-wash px-4 py-3 text-sm"
          role="status"
        >
          <p>
            {list.error instanceof ApiError
              ? list.error.message
              : "The directory could not be loaded."}
          </p>
          <Button onClick={() => void list.refetch()} type="button" variant="quiet">
            Try again
          </Button>
        </div>
      ) : null}

      {list.isLoading ? (
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
          <p className="sr-only">Loading patients</p>
          <span className="h-3 rounded-sm bg-inset" />
          <span className="h-3 rounded-sm bg-inset" />
          <span className="h-3 rounded-sm bg-inset" />
        </div>
      ) : null}

      {!list.isLoading && !showEmptyDirectory ? (
        <div className="mb-6">
          <PatientFilters
            dateError={datesInvalid}
            doctors={directory.data ?? []}
            onChange={onFiltersChange}
            showDirectoryFilters={!scoped}
            value={filters}
          />
        </div>
      ) : null}

      {showEmptyDirectory ? (
        <div className="py-16 text-center">
          <p>{scoped ? "No patients for this doctor" : "No patients yet"}</p>
          <p className="mt-1 text-sm text-ink-secondary">
            {scoped ? "Add a patient to assign them here." : "Open a doctor and add a patient."}
          </p>
          {scoped ? (
            <Button className="mt-4" onClick={() => setCreating(true)} type="button">
              Add patient
            </Button>
          ) : null}
        </div>
      ) : null}

      {showFilteredEmpty ? (
        <div className="py-16 text-center">
          <p>No patients match</p>
          <p className="mt-1 text-sm text-ink-secondary">
            {scoped ? "Clear the search." : "Clear the search or choose a different condition."}
          </p>
        </div>
      ) : null}

      {list.isSuccess && total > 0 ? (
        <PatientTable
          items={list.data.items}
          meta={list.data.meta}
          onEdit={setEditing}
          onPageChange={setPage}
          showDoctor={!scoped}
        />
      ) : null}

      {editing ? (
        <PatientFormDialog
          doctors={directory.data ?? []}
          includeDoctor={!scoped}
          onOpenChange={(next) => {
            if (!next) setEditing(null);
          }}
          open
          patient={editing}
        />
      ) : null}
    </section>
  );
}
