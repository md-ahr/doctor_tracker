"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { FilterField } from "@/components/ui/filter-field";
import { SearchField } from "@/components/ui/search-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMPTY_DOCTOR_FILTERS,
  type DoctorFilterValue,
} from "@/features/doctors/model/doctor-filter-schema";
import { isDateOrderValid } from "@/lib/time/calendar";

type DoctorFiltersProps = {
  applied: DoctorFilterValue;
  facets: { specializations: string[]; hospitals: string[] };
  onApply: (next: DoctorFilterValue) => void;
  onReset: () => void;
};

const ANY_VALUE = "__any__";

export type { DoctorFilterValue };

export function DoctorFilters({ applied, facets, onApply, onReset }: DoctorFiltersProps) {
  const [draft, setDraft] = useState<DoctorFilterValue>(applied);
  const [appliedSnapshot, setAppliedSnapshot] = useState<DoctorFilterValue>(applied);

  if (!isSameFilters(appliedSnapshot, applied)) {
    setAppliedSnapshot(applied);
    setDraft(applied);
  }

  const dateError =
    draft.createdFrom.length > 0 &&
    draft.createdTo.length > 0 &&
    !isDateOrderValid(draft.createdFrom, draft.createdTo);
  const dirty = !isSameFilters(draft, applied);
  const canReset = hasFilterValue(draft) || hasFilterValue(applied);
  const appliedCount = countFilters(applied);

  function update(partial: Partial<DoctorFilterValue>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dateError) return;
    onApply(draft);
  }

  function reset() {
    setDraft(EMPTY_DOCTOR_FILTERS);
    onReset();
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <FilterField className="sm:col-span-2 xl:col-span-4" htmlFor="doctor-search" label="Search">
          <SearchField
            id="doctor-search"
            onChange={(q) => update({ q })}
            placeholder="Amelia Rahman"
            value={draft.q}
          />
        </FilterField>

        <FilterField
          className="xl:col-span-2"
          htmlFor="doctor-specialization"
          label="Specialization"
        >
          <Select
            onValueChange={(value) =>
              update({
                specialization: value === null || value === ANY_VALUE ? "" : value,
              })
            }
            value={draft.specialization || ANY_VALUE}
          >
            <SelectTrigger id="doctor-specialization" size="compact">
              <SelectValue>{() => draft.specialization || "Any"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Any</SelectItem>
              {facets.specializations.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField className="xl:col-span-2" htmlFor="doctor-hospital" label="Hospital">
          <Select
            onValueChange={(value) =>
              update({ hospital: value === null || value === ANY_VALUE ? "" : value })
            }
            value={draft.hospital || ANY_VALUE}
          >
            <SelectTrigger id="doctor-hospital" size="compact">
              <SelectValue>{() => draft.hospital || "Any"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Any</SelectItem>
              {facets.hospitals.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField className="xl:col-span-2" htmlFor="doctor-from" label="From">
          <DateField
            describedBy={dateError ? "doctor-date-error" : undefined}
            id="doctor-from"
            invalid={dateError}
            label="From"
            onChange={(createdFrom) => update({ createdFrom })}
            value={draft.createdFrom}
          />
        </FilterField>

        <FilterField className="xl:col-span-2" htmlFor="doctor-to" label="To">
          <DateField
            describedBy={dateError ? "doctor-date-error" : undefined}
            id="doctor-to"
            invalid={dateError}
            label="To"
            onChange={(createdTo) => update({ createdTo })}
            value={draft.createdTo}
          />
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          aria-live="polite"
          className="text-xs text-ink-secondary"
          id="doctor-date-error"
          role={dateError ? "alert" : undefined}
        >
          {dateError ? (
            <span className="font-semibold text-danger-text">From is after To</span>
          ) : dirty ? (
            "Unapplied changes. Press Apply to update the results."
          ) : appliedCount > 0 ? (
            `${appliedCount} ${appliedCount === 1 ? "filter" : "filters"} applied.`
          ) : (
            "Pick a filter, then press Apply."
          )}
        </p>
        <div className="flex items-center gap-2">
          {canReset ? (
            <Button
              className="gap-1.5"
              onClick={reset}
              size="compact"
              type="button"
              variant="secondary"
            >
              <ResetIcon />
              Reset
            </Button>
          ) : null}
          <Button
            className="gap-1.5 shadow-[0_2px_6px_-4px_rgba(79,70,229,0.45)]"
            disabled={dateError || !dirty}
            size="compact"
            type="submit"
          >
            <CheckIcon />
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}

function hasFilterValue(filters: DoctorFilterValue): boolean {
  return Object.values(filters).some((value) => value.length > 0);
}

function countFilters(filters: DoctorFilterValue): number {
  return Object.values(filters).filter((value) => value.length > 0).length;
}

function isSameFilters(a: DoctorFilterValue, b: DoctorFilterValue): boolean {
  return (Object.keys(a) as (keyof DoctorFilterValue)[]).every((key) => a[key] === b[key]);
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
      <path
        d="m5 12.5 4.5 4.5L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
      <path
        d="M4 5v5h5M4.6 13a8 8 0 1 0 1.9-6.3L4 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}
