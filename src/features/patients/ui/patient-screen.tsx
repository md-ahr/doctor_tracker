"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DataEmpty, DataError, directoryErrorMessage } from "@/components/ui/data-state";
import { PlusIcon } from "@/components/ui/icons";
import type { PageSize } from "@/components/ui/pagination";
import { TableSkeleton, type TableSkeletonColumn } from "@/components/ui/table-skeleton";
import { useDoctorDirectory, usePatientList } from "@/features/patients/hooks/use-patient-list";
import type { Patient } from "@/features/patients/model/patient";
import {
  EMPTY_PATIENT_FILTERS,
  hasPatientFilters,
  patientFilterSchema,
  type PatientFilterValues,
} from "@/features/patients/model/patient-filter-schema";
import {
  readPatientListParams,
  writePatientListParams,
  type PatientListParams,
} from "@/features/patients/model/patient-list-params";
import { PatientCreateDialog } from "@/features/patients/ui/patient-create-dialog";
import { PatientFilters } from "@/features/patients/ui/patient-filters";
import { PatientFormDialog } from "@/features/patients/ui/patient-form";
import { PatientTable } from "@/features/patients/ui/patient-table";
import { FIRST_PAGE } from "@/lib/paging";
import { useClampPage } from "@/lib/url-state/use-clamp-page";
import { useListSearchParams, type HistoryMode } from "@/lib/url-state/use-list-search-params";

type PatientScreenProps = {
  doctorId?: string;
  doctorName?: string;
};

function patientSkeletonColumns(showDoctor: boolean): TableSkeletonColumn[] {
  if (!showDoctor) {
    return [
      { key: "name", className: "col-span-4 xl:col-span-3", headerWidth: "w-14" },
      { key: "condition", className: "col-span-2", headerWidth: "w-16", variant: "badge" },
      { key: "registered", className: "col-span-2 xl:col-span-3", headerWidth: "w-20" },
      { key: "phone", className: "col-span-3", headerWidth: "w-14" },
      {
        key: "actions",
        align: "right",
        className: "col-span-1",
        headerWidth: "w-14",
        variant: "actions",
      },
    ];
  }

  return [
    { key: "name", className: "col-span-4 xl:col-span-3", headerWidth: "w-14" },
    { key: "condition", className: "col-span-2", headerWidth: "w-16", variant: "badge" },
    { key: "doctor", className: "col-span-2 hidden xl:block", headerWidth: "w-16" },
    { key: "registered", className: "col-span-2", headerWidth: "w-20" },
    { key: "phone", className: "col-span-3 xl:col-span-2", headerWidth: "w-14" },
    {
      key: "actions",
      align: "right",
      className: "col-span-1",
      headerWidth: "w-14",
      variant: "actions",
    },
  ];
}

export function PatientScreen({ doctorId, doctorName }: PatientScreenProps) {
  const scoped = doctorId !== undefined;
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const { searchParams, navigate } = useListSearchParams();
  const { filters, page, limit } = useMemo(
    () => readPatientListParams(searchParams, { doctorScoped: scoped }),
    [scoped, searchParams],
  );
  const directory = useDoctorDirectory(!scoped);

  function commit(next: Partial<PatientListParams>, mode: HistoryMode = "replace") {
    navigate(
      writePatientListParams({ filters, page, limit, ...next }, { doctorScoped: scoped }),
      mode,
    );
  }

  function onApply(next: PatientFilterValues) {
    const parsed = patientFilterSchema.safeParse(next);
    if (!parsed.success) return;
    commit({ filters: parsed.data, page: FIRST_PAGE });
  }

  function onReset() {
    commit({ filters: EMPTY_PATIENT_FILTERS, page: FIRST_PAGE });
  }

  function onPageChange(next: number) {
    commit({ page: next }, "push");
  }

  function onPageSizeChange(next: PageSize) {
    commit({ limit: next, page: FIRST_PAGE });
  }

  const query = useMemo(
    () => ({
      q: filters.q || undefined,
      condition: filters.condition || undefined,
      doctorId: doctorId ?? (filters.doctorId || undefined),
      registeredFrom: filters.registeredFrom || undefined,
      registeredTo: filters.registeredTo || undefined,
      page,
      limit,
      sort: "registeredAt" as const,
    }),
    [doctorId, filters, limit, page],
  );

  const list = usePatientList(query);
  useClampPage({
    page,
    totalPages: list.data?.meta.totalPages ?? 0,
    onOutOfRange: (next) => commit({ page: next }),
  });

  const filtered = hasPatientFilters(filters);
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
        <TableSkeleton
          columns={patientSkeletonColumns(!scoped)}
          label="Loading patients"
          rows={Math.min(limit, 10)}
          showFilters
        />
      ) : null}

      {!list.isLoading && !showEmptyDirectory ? (
        <div className="portal-card-pad border-b border-line">
          <PatientFilters
            applied={filters}
            doctors={directory.data ?? []}
            onApply={onApply}
            onReset={onReset}
            showDoctorFilter={!scoped}
          />
        </div>
      ) : null}

      {showEmptyDirectory ? (
        <DataEmpty
          action={
            scoped ? (
              <Button onClick={() => setCreating(true)} type="button">
                <PlusIcon />
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
            scoped
              ? "Use Reset to clear the search and filters."
              : "Use Reset to clear the filters, or choose a different condition."
          }
          title="No patients match"
        />
      ) : null}

      {list.isSuccess && total > 0 ? (
        <div className="portal-card-pad">
          <PatientTable
            items={list.data.items}
            limit={limit}
            meta={list.data.meta}
            onEdit={setEditing}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
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
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[18px] leading-tight">
              {scoped ? "Patients" : "Patient registry"}
            </h2>
            <span className="card-count">
              {list.isLoading ? "Loading" : `${total} ${total === 1 ? "patient" : "patients"}`}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            {scoped
              ? "Filter this doctor's list by condition or registration date, then edit or remove a record."
              : "Active patients across every doctor, with condition and registration filters."}
          </p>
        </div>
        {scoped ? (
          <div className="flex flex-wrap items-center gap-2">
            <PatientCreateDialog
              doctorId={doctorId}
              doctorName={doctorName}
              onOpenChange={setCreating}
              open={creating}
            />
          </div>
        ) : null}
      </div>
      {body}
    </section>
  );

  if (scoped) return card;

  return (
    <div className="flex flex-col gap-6">
      <header className="page-header">
        <div>
          <h1>Patients</h1>
          <p className="page-context">Active patients across every doctor.</p>
        </div>
      </header>
      {card}
    </div>
  );
}
