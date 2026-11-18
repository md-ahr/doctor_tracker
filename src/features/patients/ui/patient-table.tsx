"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PencilIcon } from "@/components/ui/icons";
import { Pagination, type PageSize } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableFrame,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeletePatientButton } from "@/features/patients/ui/delete-patient-button";
import {
  CONDITION_MARKS,
  type Patient,
  type PatientCondition,
} from "@/features/patients/model/patient";
import type { PageMeta } from "@/lib/api/types";
import { cn, initials } from "@/lib/utils";

type PatientTableProps = {
  items: Patient[];
  meta?: PageMeta;
  limit: PageSize;
  showDoctor: boolean;
  onEdit: (patient: Patient) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: PageSize) => void;
};

export function ConditionMark({ condition }: { condition: PatientCondition }) {
  const mark = CONDITION_MARKS[condition];

  return (
    <span
      className="inline-flex h-6 items-center rounded-full px-2 font-sans text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: mark.wash, color: mark.ink }}
    >
      {mark.label}
    </span>
  );
}

/**
 * Patients in a table from tablet width up. Below `lg` the doctor column folds
 * into a caption under the patient name so the five visible columns keep their
 * breathable widths; phones get record cards instead.
 */
export function PatientTable({
  items,
  meta,
  limit,
  showDoctor,
  onEdit,
  onPageChange,
  onPageSizeChange,
}: PatientTableProps) {
  return (
    <div>
      <div className="hidden md:block">
        <TableFrame>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[29%] xl:w-[22%]">Name</TableHead>
                <TableHead className="w-[18%] xl:w-[14%]">Condition</TableHead>
                {showDoctor ? (
                  <TableHead className="hidden w-[19%] xl:table-cell">Doctor</TableHead>
                ) : null}
                <TableHead className="w-[17%] xl:w-[15%]">Registered</TableHead>
                <TableHead className="w-[21%] xl:w-[19%]">Phone</TableHead>
                <TableHead className="w-[15%] text-right xl:w-[11%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="pr-2">
                    <span className="block truncate font-semibold" title={patient.fullName}>
                      {patient.fullName}
                    </span>
                    {showDoctor ? (
                      <Link
                        className="mt-0.5 block truncate text-[11.5px] font-medium text-ink-secondary hover:text-action-hover hover:underline xl:hidden"
                        href={`/doctors/${patient.doctorId}`}
                        title={patient.doctorName}
                      >
                        {patient.doctorName}
                      </Link>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <ConditionMark condition={patient.condition} />
                  </TableCell>
                  {showDoctor ? (
                    <TableCell className="hidden xl:table-cell">
                      <Link
                        className="block truncate text-action-hover underline underline-offset-2"
                        href={`/doctors/${patient.doctorId}`}
                        title={patient.doctorName}
                      >
                        {patient.doctorName}
                      </Link>
                    </TableCell>
                  ) : null}
                  <TableCell className="tabular-nums whitespace-nowrap">
                    {formatRecordDate(patient.registeredAt)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    <span className="block truncate">{patient.phone ?? "—"}</span>
                  </TableCell>
                  <TableCell className="px-1.5">
                    <RowActions
                      className="justify-end"
                      onEdit={() => onEdit(patient)}
                      patient={patient}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      </div>

      <ul className="record-grid grid md:hidden">
        {items.map((patient) => (
          <li className="record-card" key={patient.id}>
            <div className="record-card-head">
              <span aria-hidden="true" className="record-avatar">
                {initials(patient.fullName)}
              </span>
              <div className="record-identity">
                <p className="record-title" title={patient.fullName}>
                  {patient.fullName}
                </p>
                <p className="record-sub">Registered {formatRecordDate(patient.registeredAt)}</p>
              </div>
              <ConditionMark condition={patient.condition} />
            </div>

            <dl className="record-facts">
              {showDoctor ? (
                <div className="record-fact">
                  <dt>Doctor</dt>
                  <dd>
                    <Link href={`/doctors/${patient.doctorId}`} title={patient.doctorName}>
                      {patient.doctorName}
                    </Link>
                  </dd>
                </div>
              ) : null}
              <div className="record-fact">
                <dt>Phone</dt>
                <dd data-numeric="true">{patient.phone ?? "—"}</dd>
              </div>
            </dl>

            <div className="record-actions">
              <Button
                aria-label={`Edit ${patient.fullName}`}
                className="flex-1"
                onClick={() => onEdit(patient)}
                type="button"
                variant="secondary"
              >
                <PencilIcon />
                Edit record
              </Button>
              <DeletePatientButton patient={patient} />
            </div>
          </li>
        ))}
      </ul>

      <Pagination
        itemCount={items.length}
        limit={limit}
        meta={meta}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

function RowActions({
  patient,
  onEdit,
  className,
}: {
  patient: Patient;
  onEdit: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        aria-label={`Edit ${patient.fullName}`}
        className="size-(--control-height) px-0"
        onClick={onEdit}
        type="button"
        variant="quiet"
      >
        <PencilIcon />
      </Button>
      <DeletePatientButton patient={patient} />
    </div>
  );
}

function formatRecordDate(value: string): string {
  try {
    const date = value.includes("T")
      ? Temporal.Instant.from(value).toZonedDateTimeISO("UTC").toPlainDate()
      : Temporal.PlainDate.from(value);
    const month = date.toLocaleString("en-GB", { month: "short" });
    return `${date.day} ${month} ${date.year}`;
  } catch {
    return value;
  }
}
