"use client";

import Link from "next/link";

import { Pagination, type PageSize } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Doctor } from "@/features/doctors/model/doctor";
import type { PageMeta } from "@/lib/api/types";

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
      <div className="hidden lg:block">
        <Table className="xl:table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[26%]">Name</TableHead>
              <TableHead className="w-[20%] xl:w-[21%]">Specialization</TableHead>
              <TableHead className="w-[30%] xl:w-[290px]">Hospital</TableHead>
              <TableHead className="w-[10%] text-right xl:w-[88px]">Patients</TableHead>
              <TableHead className="w-[14%] text-right whitespace-nowrap xl:w-auto">
                Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <Link
                    className="block font-semibold text-action-hover underline underline-offset-2 xl:truncate"
                    href={`/doctors/${doctor.id}`}
                    title={doctor.name}
                  >
                    {doctor.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="block xl:truncate" title={doctor.specialization}>
                    {doctor.specialization}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="block xl:truncate" title={doctor.hospital}>
                    {doctor.hospital}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {countLabel(patientCounts, doctor.id)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {formatRecordDate(doctor.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="lg:hidden">
        {items.map((doctor) => (
          <li className="border-b border-line py-4" key={doctor.id}>
            <Link
              className="font-semibold text-action-hover underline underline-offset-2"
              href={`/doctors/${doctor.id}`}
            >
              {doctor.name}
            </Link>
            <p className="text-sm text-ink-secondary">Specialization {doctor.specialization}</p>
            <p className="text-sm text-ink-secondary">Hospital {doctor.hospital}</p>
            <p className="text-sm text-ink-secondary">
              Patients {countLabel(patientCounts, doctor.id)}
            </p>
            <p className="text-sm text-ink-secondary">
              Created {formatRecordDate(doctor.createdAt)}
            </p>
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
