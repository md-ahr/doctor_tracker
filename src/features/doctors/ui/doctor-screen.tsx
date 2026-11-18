"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DataEmpty,
  DataError,
  DataLoading,
  directoryErrorMessage,
} from "@/components/ui/data-state";
import { useDoctorFacets } from "@/features/doctors/hooks/use-doctor-facets";
import { useDoctorList } from "@/features/doctors/hooks/use-doctor-list";
import { DoctorFilters, type DoctorFilterValue } from "@/features/doctors/ui/doctor-filters";
import { DoctorFormDialog } from "@/features/doctors/ui/doctor-form";
import { DoctorTable } from "@/features/doctors/ui/doctor-table";
import { isDateOrderValid } from "@/lib/time/calendar";

const emptyFilters: DoctorFilterValue = {
  q: "",
  specialization: "",
  hospital: "",
  createdFrom: "",
  createdTo: "",
};

export function DoctorScreen() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState<DoctorFilterValue>(emptyFilters);
  const [appliedDates, setAppliedDates] = useState({ from: "", to: "" });
  const facets = useDoctorFacets();

  const datesInvalid =
    filters.createdFrom.length > 0 &&
    filters.createdTo.length > 0 &&
    !isDateOrderValid(filters.createdFrom, filters.createdTo);

  function onFiltersChange(next: DoctorFilterValue) {
    setFilters(next);
    setPage(1);
    const reversed =
      next.createdFrom.length > 0 &&
      next.createdTo.length > 0 &&
      !isDateOrderValid(next.createdFrom, next.createdTo);
    if (!reversed) {
      setAppliedDates({ from: next.createdFrom, to: next.createdTo });
    }
  }

  const query = useMemo(
    () => ({
      q: filters.q.trim() || undefined,
      specialization: filters.specialization || undefined,
      hospital: filters.hospital || undefined,
      createdFrom: appliedDates.from || undefined,
      createdTo: appliedDates.to || undefined,
      page,
      limit: 20 as const,
      sort: "createdAt" as const,
    }),
    [appliedDates.from, appliedDates.to, filters.hospital, filters.q, filters.specialization, page],
  );

  const list = useDoctorList(query);
  const filtered =
    filters.q.trim().length > 0 ||
    filters.specialization.length > 0 ||
    filters.hospital.length > 0 ||
    appliedDates.from.length > 0 ||
    appliedDates.to.length > 0;
  const total = list.data?.meta.total ?? 0;
  const showEmptyDirectory = list.isSuccess && total === 0 && !filtered;
  const showFilteredEmpty = list.isSuccess && total === 0 && filtered;

  return (
    <section className="portal-card">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>Doctors</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Directory of doctors. Date filter uses the day the record was created.
          </p>
        </div>
        <DoctorFormDialog onOpenChange={setCreating} open={creating} />
      </header>

      {list.isError ? (
        <div className="mb-4">
          <DataError
            message={directoryErrorMessage(list.error)}
            onRetry={() => void list.refetch()}
          />
        </div>
      ) : null}

      {list.isLoading ? <DataLoading label="Loading doctors" /> : null}

      {!list.isLoading && !showEmptyDirectory ? (
        <div className="mb-6">
          <DoctorFilters
            dateError={datesInvalid}
            facets={{
              specializations: facets.data?.specializations ?? [],
              hospitals: facets.data?.hospitals ?? [],
            }}
            onChange={onFiltersChange}
            value={filters}
          />
        </div>
      ) : null}

      {showEmptyDirectory ? (
        <DataEmpty
          action={
            <Button onClick={() => setCreating(true)} type="button">
              Add doctor
            </Button>
          }
          guidance="Add the first doctor to start the directory."
          title="No doctors yet"
        />
      ) : null}

      {showFilteredEmpty ? (
        <DataEmpty guidance="Clear the search or widen the dates." title="No doctors match" />
      ) : null}

      {list.isSuccess && total > 0 ? (
        <DoctorTable items={list.data.items} meta={list.data.meta} onPageChange={setPage} />
      ) : null}
    </section>
  );
}
