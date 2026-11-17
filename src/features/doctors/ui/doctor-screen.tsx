"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useDoctorFacets } from "@/features/doctors/hooks/use-doctor-facets";
import { useDoctorList } from "@/features/doctors/hooks/use-doctor-list";
import { DoctorFilters, type DoctorFilterValue } from "@/features/doctors/ui/doctor-filters";
import { DoctorFormDialog } from "@/features/doctors/ui/doctor-form";
import { DoctorTable } from "@/features/doctors/ui/doctor-table";
import { ApiError } from "@/lib/api/types";
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
          <p className="sr-only">Loading doctors</p>
          <span className="h-3 rounded-sm bg-inset" />
          <span className="h-3 rounded-sm bg-inset" />
          <span className="h-3 rounded-sm bg-inset" />
        </div>
      ) : null}

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
        <div className="py-16 text-center">
          <p>No doctors yet</p>
          <p className="mt-1 text-sm text-ink-secondary">
            Add the first doctor to start the directory.
          </p>
          <Button className="mt-4" onClick={() => setCreating(true)} type="button">
            Add doctor
          </Button>
        </div>
      ) : null}

      {showFilteredEmpty ? (
        <div className="py-16 text-center">
          <p>No doctors match</p>
          <p className="mt-1 text-sm text-ink-secondary">Clear the search or widen the dates.</p>
        </div>
      ) : null}

      {list.isSuccess && total > 0 ? (
        <DoctorTable items={list.data.items} meta={list.data.meta} onPageChange={setPage} />
      ) : null}
    </section>
  );
}
