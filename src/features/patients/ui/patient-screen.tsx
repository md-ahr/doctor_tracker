"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DataEmpty,
  DataError,
  DataLoading,
  directoryErrorMessage,
} from "@/components/ui/data-state";
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

  const body: ReactNode = (
    <>
      {list.isError ? (
        <div className="portal-card-pad">
          <DataError
            message={directoryErrorMessage(list.error)}
            onRetry={() => void list.refetch()}
          />
        </div>
      ) : null}

      {list.isLoading ? (
        <div className="portal-card-pad">
          <DataLoading label="Loading patients" />
        </div>
      ) : null}

      {!list.isLoading && !showEmptyDirectory ? (
        <div className="portal-card-pad border-b border-line">
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
        <DataEmpty
          action={
            scoped ? (
              <Button onClick={() => setCreating(true)} type="button">
                Add patient
              </Button>
            ) : undefined
          }
          guidance={
            scoped ? "Add a patient to assign them here." : "Open a doctor and add a patient."
          }
          title={scoped ? "No patients for this doctor" : "No patients yet"}
        />
      ) : null}

      {showFilteredEmpty ? (
        <DataEmpty
          guidance={
            scoped ? "Clear the search." : "Clear the search or choose a different condition."
          }
          title="No patients match"
        />
      ) : null}

      {list.isSuccess && total > 0 ? (
        <div className="portal-card-pad">
          <PatientTable
            items={list.data.items}
            meta={list.data.meta}
            onEdit={setEditing}
            onPageChange={setPage}
            showDoctor={!scoped}
          />
        </div>
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
    </>
  );

  const card = (
    <section className="portal-card portal-card-flush">
      <div className="portal-card-pad flex flex-wrap items-start justify-between gap-3 border-b border-line">
        <div>
          <h2 className="text-[18px] leading-tight">{scoped ? "Patients" : "Patient registry"}</h2>
          <p className="mt-1 text-xs text-ink-secondary">
            {scoped
              ? "Search this doctor's list, then edit or remove a record."
              : "Active patients across every doctor, with condition and registration filters."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="card-count">
            {list.isLoading ? "Loading" : `${total} ${total === 1 ? "patient" : "patients"}`}
          </span>
          {scoped ? (
            <PatientCreateDialog
              doctorId={doctorId}
              doctorName={doctorName}
              onOpenChange={setCreating}
              open={creating}
            />
          ) : null}
        </div>
      </div>
      {body}
    </section>
  );

  if (scoped) return card;

  return (
    <div className="flex flex-col gap-6">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Registry</p>
          <h1>Patients</h1>
          <p className="page-context">Active patients across every doctor.</p>
        </div>
      </header>
      {card}
    </div>
  );
}
