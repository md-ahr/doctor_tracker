"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CONDITION_MARKS,
  PATIENT_CONDITIONS,
  type DoctorOption,
} from "@/features/patients/model/patient";
import type { PatientFilterValues } from "@/features/patients/model/patient-filter-schema";

type PatientFiltersProps = {
  value: PatientFilterValues;
  dateError: boolean;
  doctors: DoctorOption[];
  showDirectoryFilters: boolean;
  onChange: (next: PatientFilterValues) => void;
};

const emptyFilters: PatientFilterValues = {
  q: "",
  condition: "",
  doctorId: "",
  registeredFrom: "",
  registeredTo: "",
};

const selectClass =
  "h-(--control-height-compact) rounded-(--radius-control) border border-control bg-sheet px-3 text-[13px] text-ink transition-colors duration-150 outline-none focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function PatientFilters({
  value,
  dateError,
  doctors,
  showDirectoryFilters,
  onChange,
}: PatientFiltersProps) {
  const [search, setSearch] = useState(value.q);
  const valueRef = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(partial: Partial<PatientFilterValues>) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const next = { ...valueRef.current, ...partial };
    valueRef.current = next;
    onChange(next);
  }

  function onSearch(event: ChangeEvent<HTMLInputElement>) {
    const q = event.target.value;
    setSearch(q);
    valueRef.current = { ...valueRef.current, q };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onChange(valueRef.current);
    }, 300);
  }

  const active =
    search.length > 0 ||
    value.condition.length > 0 ||
    value.doctorId.length > 0 ||
    value.registeredFrom.length > 0 ||
    value.registeredTo.length > 0;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <Label htmlFor="patient-search">Search</Label>
        <Input
          className="h-(--control-height-compact)"
          id="patient-search"
          onChange={onSearch}
          placeholder="Noah Khan"
          value={search}
        />
      </div>
      {showDirectoryFilters ? (
        <>
          <div className="flex min-w-40 flex-col gap-1">
            <Label htmlFor="patient-condition">Condition</Label>
            <select
              className={selectClass}
              id="patient-condition"
              onChange={(event) =>
                commit({ condition: event.target.value as PatientFilterValues["condition"] })
              }
              value={value.condition}
            >
              <option value="">Any</option>
              {PATIENT_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {CONDITION_MARKS[condition].label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-40 flex-col gap-1">
            <Label htmlFor="patient-doctor">Doctor</Label>
            <select
              className={selectClass}
              id="patient-doctor"
              onChange={(event) => commit({ doctorId: event.target.value })}
              value={value.doctorId}
            >
              <option value="">Any</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="patient-from">From</Label>
            <Input
              aria-describedby={dateError ? "patient-date-error" : undefined}
              aria-invalid={dateError || undefined}
              className="h-(--control-height-compact)"
              id="patient-from"
              onChange={(event) => commit({ registeredFrom: event.target.value })}
              type="date"
              value={value.registeredFrom}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="patient-to">To</Label>
            <Input
              aria-describedby={dateError ? "patient-date-error" : undefined}
              aria-invalid={dateError || undefined}
              className="h-(--control-height-compact)"
              id="patient-to"
              onChange={(event) => commit({ registeredTo: event.target.value })}
              type="date"
              value={value.registeredTo}
            />
          </div>
        </>
      ) : null}
      {dateError ? (
        <p className="basis-full text-xs text-danger-text" id="patient-date-error">
          From is after To
        </p>
      ) : null}
      {active ? (
        <Button
          onClick={() => {
            setSearch("");
            commit(emptyFilters);
          }}
          type="button"
          variant="quiet"
        >
          Clear
        </Button>
      ) : null}
    </div>
  );
}
