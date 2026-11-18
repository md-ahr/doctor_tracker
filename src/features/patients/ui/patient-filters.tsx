"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { FilterField } from "@/components/ui/filter-field";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SearchField } from "@/components/ui/search-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toDoctorSelectOptions } from "@/features/patients/model/doctor-options";
import {
  CONDITION_MARKS,
  PATIENT_CONDITIONS,
  type DoctorOption,
} from "@/features/patients/model/patient";
import {
  EMPTY_PATIENT_FILTERS,
  countPatientFilters,
  hasPatientFilters,
  type PatientFilterValues,
} from "@/features/patients/model/patient-filter-schema";
import { isDateOrderValid } from "@/lib/time/calendar";

type PatientFiltersProps = {
  applied: PatientFilterValues;
  doctors: DoctorOption[];
  showDoctorFilter: boolean;
  onApply: (next: PatientFilterValues) => void;
  onReset: () => void;
};

const ANY_VALUE = "__any__";

export function PatientFilters({
  applied,
  doctors,
  showDoctorFilter,
  onApply,
  onReset,
}: PatientFiltersProps) {
  const [draft, setDraft] = useState<PatientFilterValues>(applied);
  const [appliedSnapshot, setAppliedSnapshot] = useState<PatientFilterValues>(applied);

  if (!isSameFilters(appliedSnapshot, applied)) {
    setAppliedSnapshot(applied);
    setDraft(applied);
  }

  const dateError =
    draft.registeredFrom.length > 0 &&
    draft.registeredTo.length > 0 &&
    !isDateOrderValid(draft.registeredFrom, draft.registeredTo);
  const dirty = !isSameFilters(draft, applied);
  const canReset = hasPatientFilters(draft) || hasPatientFilters(applied);
  const appliedCount = countPatientFilters(applied);
  const doctorPickerOptions = useMemo(() => toDoctorSelectOptions(doctors), [doctors]);

  function update(partial: Partial<PatientFilterValues>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dateError) return;
    onApply(draft);
  }

  function reset() {
    setDraft(EMPTY_PATIENT_FILTERS);
    onReset();
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <FilterField
          className="sm:col-span-2 xl:col-span-4"
          htmlFor="patient-search"
          label="Search"
        >
          <SearchField
            id="patient-search"
            onChange={(q) => update({ q })}
            placeholder="Noah Khan"
            value={draft.q}
          />
        </FilterField>

        <FilterField
          className={showDoctorFilter ? "xl:col-span-2" : "sm:col-span-2 xl:col-span-2"}
          htmlFor="patient-condition"
          label="Condition"
        >
          <Select
            onValueChange={(value) =>
              update({
                condition:
                  value === null || value === ANY_VALUE
                    ? ""
                    : (value as PatientFilterValues["condition"]),
              })
            }
            value={draft.condition || ANY_VALUE}
          >
            <SelectTrigger id="patient-condition" size="compact">
              <SelectValue>{() => conditionLabel(draft.condition)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Any</SelectItem>
              {PATIENT_CONDITIONS.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {CONDITION_MARKS[condition].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        {showDoctorFilter ? (
          <FilterField className="xl:col-span-2" htmlFor="patient-doctor" label="Doctor">
            <SearchableSelect
              anyLabel="Any"
              emptyLabel="No doctors match"
              id="patient-doctor"
              onValueChange={(doctorId) => update({ doctorId })}
              options={doctorPickerOptions}
              searchLabel="Search doctors"
              searchPlaceholder="Search by name"
              value={draft.doctorId}
            />
          </FilterField>
        ) : null}

        <FilterField
          className={showDoctorFilter ? "xl:col-span-2" : "xl:col-span-3"}
          htmlFor="patient-from"
          label="From"
        >
          <DateField
            describedBy={dateError ? "patient-date-error" : undefined}
            id="patient-from"
            invalid={dateError}
            label="From"
            onChange={(registeredFrom) => update({ registeredFrom })}
            value={draft.registeredFrom}
          />
        </FilterField>

        <FilterField
          className={showDoctorFilter ? "xl:col-span-2" : "xl:col-span-3"}
          htmlFor="patient-to"
          label="To"
        >
          <DateField
            describedBy={dateError ? "patient-date-error" : undefined}
            id="patient-to"
            invalid={dateError}
            label="To"
            onChange={(registeredTo) => update({ registeredTo })}
            value={draft.registeredTo}
          />
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          aria-live="polite"
          className="text-xs text-ink-secondary"
          id="patient-date-error"
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

function conditionLabel(condition: PatientFilterValues["condition"]): string {
  return condition === "" ? "Any" : CONDITION_MARKS[condition].label;
}

function isSameFilters(a: PatientFilterValues, b: PatientFilterValues): boolean {
  return (Object.keys(a) as (keyof PatientFilterValues)[]).every((key) => a[key] === b[key]);
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
