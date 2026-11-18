"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PencilIcon } from "@/components/ui/icons";
import { Pagination, type PageSize } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
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
import { cn } from "@/lib/utils";

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
      className="inline-flex h-6 items-center rounded-full px-2 font-sans text-xs font-semibold"
      style={{ backgroundColor: mark.wash, color: mark.ink }}
    >
      {mark.label}
    </span>
  );
}

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
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Condition</TableHead>
              {showDoctor ? <TableHead>Doctor</TableHead> : null}
              <TableHead>Registered</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-semibold">{patient.fullName}</TableCell>
                <TableCell>
                  <ConditionMark condition={patient.condition} />
                </TableCell>
                {showDoctor ? (
                  <TableCell>
                    <Link
                      className="text-action-hover underline underline-offset-2"
                      href={`/doctors/${patient.doctorId}`}
                    >
                      {patient.doctorName}
                    </Link>
                  </TableCell>
                ) : null}
                <TableCell>{formatRecordDate(patient.registeredAt)}</TableCell>
                <TableCell>{patient.phone ?? "—"}</TableCell>
                <TableCell>
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
      </div>
      <ul className="lg:hidden">
        {items.map((patient) => (
          <li className="border-b border-line py-4" key={patient.id}>
            <p className="font-semibold">{patient.fullName}</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Condition <ConditionMark condition={patient.condition} />
            </p>
            {showDoctor ? (
              <p className="text-sm text-ink-secondary">
                Doctor{" "}
                <Link
                  className="text-action-hover underline underline-offset-2"
                  href={`/doctors/${patient.doctorId}`}
                >
                  {patient.doctorName}
                </Link>
              </p>
            ) : null}
            <p className="text-sm text-ink-secondary">
              Registered {formatRecordDate(patient.registeredAt)}
            </p>
            <p className="text-sm text-ink-secondary">Phone {patient.phone ?? "—"}</p>
            <div className="mt-2">
              <RowActions onEdit={() => onEdit(patient)} patient={patient} />
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
