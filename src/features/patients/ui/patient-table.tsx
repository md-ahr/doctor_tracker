"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
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

type PatientTableProps = {
  items: Patient[];
  meta?: PageMeta;
  showDoctor: boolean;
  onEdit: (patient: Patient) => void;
  onPageChange: (page: number) => void;
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

export function PatientTable({ items, meta, showDoctor, onEdit, onPageChange }: PatientTableProps) {
  const total = meta?.total ?? items.length;
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? 20;
  const totalPages = meta?.totalPages ?? 1;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div>
      <div className="hidden min-[1024px]:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Condition</TableHead>
              {showDoctor ? <TableHead>Doctor</TableHead> : null}
              <TableHead>Registered</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
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
                  <RowActions onEdit={() => onEdit(patient)} patient={patient} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="min-[1024px]:hidden">
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
      {total > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-secondary">
          <p>
            Showing {start}–{end} of {total}
          </p>
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                size="compact"
                type="button"
                variant="secondary"
              >
                Previous
              </Button>
              <p>
                Page {page} of {totalPages}
              </p>
              <Button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                size="compact"
                type="button"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function RowActions({ patient, onEdit }: { patient: Patient; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button onClick={onEdit} type="button" variant="quiet">
        Edit
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
