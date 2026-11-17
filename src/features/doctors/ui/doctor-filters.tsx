"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DoctorFilterValue = {
  q: string;
  specialization: string;
  hospital: string;
  createdFrom: string;
  createdTo: string;
};

type DoctorFiltersProps = {
  value: DoctorFilterValue;
  facets: { specializations: string[]; hospitals: string[] };
  dateError: boolean;
  onChange: (next: DoctorFilterValue) => void;
};

const emptyFilters: DoctorFilterValue = {
  q: "",
  specialization: "",
  hospital: "",
  createdFrom: "",
  createdTo: "",
};

export function DoctorFilters({ value, facets, dateError, onChange }: DoctorFiltersProps) {
  const [search, setSearch] = useState(value.q);
  const valueRef = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(partial: Partial<DoctorFilterValue>) {
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
    value.specialization.length > 0 ||
    value.hospital.length > 0 ||
    value.createdFrom.length > 0 ||
    value.createdTo.length > 0;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <Label htmlFor="doctor-search">Search</Label>
        <Input id="doctor-search" onChange={onSearch} placeholder="Amelia Rahman" value={search} />
      </div>
      <FilterSelect
        label="Specialization"
        onChange={(specialization) => commit({ specialization })}
        options={facets.specializations}
        value={value.specialization}
      />
      <FilterSelect
        label="Hospital"
        onChange={(hospital) => commit({ hospital })}
        options={facets.hospitals}
        value={value.hospital}
      />
      <div className="flex flex-col gap-1">
        <Label htmlFor="doctor-from">From</Label>
        <Input
          aria-describedby={dateError ? "doctor-date-error" : undefined}
          aria-invalid={dateError || undefined}
          id="doctor-from"
          onChange={(event) => commit({ createdFrom: event.target.value })}
          type="date"
          value={value.createdFrom}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="doctor-to">To</Label>
        <Input
          aria-describedby={dateError ? "doctor-date-error" : undefined}
          aria-invalid={dateError || undefined}
          id="doctor-to"
          onChange={(event) => commit({ createdTo: event.target.value })}
          type="date"
          value={value.createdTo}
        />
      </div>
      {dateError ? (
        <p className="basis-full text-xs text-danger-text" id="doctor-date-error">
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const id = `doctor-${label.toLowerCase()}`;

  return (
    <div className="flex min-w-40 flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <select
        className="h-(--control-height) rounded-(--radius-control) border border-control bg-sheet px-3 text-[15px] text-ink"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
