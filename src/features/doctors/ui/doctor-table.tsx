"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
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
import type { Doctor } from "@/features/doctors/model/doctor";
import type { PageMeta } from "@/lib/api/types";
import { cn, initials } from "@/lib/utils";

type DoctorTableProps = {
  items: Doctor[];
  meta?: PageMeta;
  limit: PageSize;
  /** Active patient counts by doctor id. Absent until the counts load. */
  patientCounts?: Record<string, number>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: PageSize) => void;
};

export function DoctorTable({
  items,
  meta,
  limit,
  patientCounts,
  onPageChange,
  onPageSizeChange,
}: DoctorTableProps) {
  return (
    <div>
      <div className="hidden md:block">
        <TableFrame>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[20%]">Specialization</TableHead>
                <TableHead className="w-[27%]">Hospital</TableHead>
                <TableHead className="w-[13%] text-right">Patients</TableHead>
                <TableHead className="w-[15%] text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <Link
                      className="block truncate font-semibold text-action-hover underline underline-offset-2"
                      href={`/doctors/${doctor.id}`}
                      title={doctor.name}
                    >
                      {doctor.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="block truncate" title={doctor.specialization}>
                      {doctor.specialization}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block truncate" title={doctor.hospital}>
                      {doctor.hospital}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {countLabel(patientCounts, doctor.id)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {formatRecordDate(doctor.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableFrame>
      </div>

      <ul className="record-grid grid md:hidden">
        {items.map((doctor) => (
          <li className="record-card" key={doctor.id}>
            <div className="record-card-head">
              <span aria-hidden="true" className="record-avatar">
                {initials(doctor.name)}
              </span>
              <div className="record-identity">
                <Link className="record-title" href={`/doctors/${doctor.id}`} title={doctor.name}>
                  {doctor.name}
                </Link>
                <p className="record-sub">{doctor.specialization}</p>
              </div>
              <span className="record-badge">
                {countLabel(patientCounts, doctor.id)}
                <span className="sr-only"> active patients</span>
              </span>
            </div>

            <dl className="record-facts">
              <div className="record-fact">
                <dt>Hospital</dt>
                <dd data-wrap="true">{doctor.hospital}</dd>
              </div>
              <div className="record-fact">
                <dt>Created</dt>
                <dd data-numeric="true">{formatRecordDate(doctor.createdAt)}</dd>
              </div>
            </dl>

            <div className="record-actions">
              <Link
                className={cn(buttonVariants({ variant: "secondary" }), "w-full justify-center")}
                href={`/doctors/${doctor.id}`}
              >
                View patients
              </Link>
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

function formatRecordDate(iso: string): string {
  try {
    const date = Temporal.Instant.from(iso).toZonedDateTimeISO("UTC").toPlainDate();
    const month = date.toLocaleString("en-GB", { month: "short" });
    return `${date.day} ${month} ${date.year}`;
  } catch {
    return iso;
  }
}

/**
 * The aggregate lists every doctor, so once it loads a missing id is a zero. Before
 * it loads there is no honest number to print, and the cell shows an em dash.
 */
function countLabel(patientCounts: Record<string, number> | undefined, doctorId: string): string {
  if (patientCounts === undefined) return "—";
  return String(patientCounts[doctorId] ?? 0);
}
