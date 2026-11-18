"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DataEmpty,
  DataError,
  DataLoading,
  directoryErrorMessage,
} from "@/components/ui/data-state";
import { PlusIcon } from "@/components/ui/icons";
import type { PageSize } from "@/components/ui/pagination";
import {
  EMPTY_DOCTOR_FILTERS,
  doctorFilterSchema,
} from "@/features/doctors/model/doctor-filter-schema";
import {
  readDoctorListParams,
  writeDoctorListParams,
  type DoctorListParams,
} from "@/features/doctors/model/doctor-list-params";
import { useDoctorFacets } from "@/features/doctors/hooks/use-doctor-facets";
import { useDoctorList } from "@/features/doctors/hooks/use-doctor-list";
import { useDoctorPatientCounts } from "@/features/doctors/hooks/use-doctor-patient-counts";
import { DoctorFilters, type DoctorFilterValue } from "@/features/doctors/ui/doctor-filters";
import { DoctorFormDialog } from "@/features/doctors/ui/doctor-form";
import { DoctorTable } from "@/features/doctors/ui/doctor-table";
import { FIRST_PAGE } from "@/lib/paging";
import { useClampPage } from "@/lib/url-state/use-clamp-page";
import { useListSearchParams, type HistoryMode } from "@/lib/url-state/use-list-search-params";

export function DoctorScreen() {
  const [creating, setCreating] = useState(false);
  const { searchParams, navigate } = useListSearchParams();
  const { filters, page, limit } = useMemo(
    () => readDoctorListParams(searchParams),
    [searchParams],
  );
  const facets = useDoctorFacets();

  function commit(next: Partial<DoctorListParams>, mode: HistoryMode = "replace") {
    navigate(writeDoctorListParams({ filters, page, limit, ...next }), mode);
  }

  function onApply(next: DoctorFilterValue) {
    const parsed = doctorFilterSchema.safeParse(next);
    if (!parsed.success) return;
    commit({ filters: parsed.data, page: FIRST_PAGE });
  }

  function onReset() {
    commit({ filters: EMPTY_DOCTOR_FILTERS, page: FIRST_PAGE });
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
      specialization: filters.specialization || undefined,
      hospital: filters.hospital || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      page,
      limit,
      sort: "createdAt" as const,
    }),
    [filters, limit, page],
  );

  const list = useDoctorList(query);
  const patientCounts = useDoctorPatientCounts();
  useClampPage({
    page,
    totalPages: list.data?.meta.totalPages ?? 0,
    onOutOfRange: (next) => commit({ page: next }),
  });

  const filtered =
    filters.q.length > 0 ||
    filters.specialization.length > 0 ||
    filters.hospital.length > 0 ||
    filters.createdFrom.length > 0 ||
    filters.createdTo.length > 0;
  const total = list.data?.meta.total ?? 0;
  const showEmptyDirectory = list.isSuccess && total === 0 && !filtered;
  const showFilteredEmpty = list.isSuccess && total === 0 && filtered;

  return (
    <div className="flex flex-col gap-6">
      <header className="page-header">
        <div>
          <h1>Doctors</h1>
          <p className="page-context">
            Directory of doctors. Date filter uses the day the record was created.
          </p>
        </div>
        <div className="page-actions">
          <DoctorFormDialog onOpenChange={setCreating} open={creating} />
        </div>
      </header>

      <section className="portal-card portal-card-flush">
        <div className="portal-card-pad flex flex-wrap items-start justify-between gap-3 border-b border-line">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[18px] leading-tight">Directory</h2>
              <span className="card-count">
                {list.isLoading ? "Loading" : `${total} ${total === 1 ? "doctor" : "doctors"}`}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              Search, filter, and open a doctor to manage their patients.
            </p>
          </div>
        </div>

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
            <DataLoading label="Loading doctors" />
          </div>
        ) : null}

        {!list.isLoading && !showEmptyDirectory ? (
          <div className="portal-card-pad border-b border-line">
            <DoctorFilters
              applied={filters}
              facets={{
                specializations: facets.data?.specializations ?? [],
                hospitals: facets.data?.hospitals ?? [],
              }}
              onApply={onApply}
              onReset={onReset}
            />
          </div>
        ) : null}

        {showEmptyDirectory ? (
          <DataEmpty
            action={
              <Button onClick={() => setCreating(true)} type="button">
                <PlusIcon />
                Add doctor
              </Button>
            }
            guidance="Add the first doctor to start the directory."
            title="No doctors yet"
          />
        ) : null}

        {showFilteredEmpty ? (
          <DataEmpty
            guidance="Use Reset to clear the filters, or widen the dates."
            title="No doctors match"
          />
        ) : null}

        {list.isSuccess && total > 0 ? (
          <div className="portal-card-pad">
            <DoctorTable
              items={list.data.items}
              limit={limit}
              meta={list.data.meta}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              patientCounts={patientCounts.data}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
