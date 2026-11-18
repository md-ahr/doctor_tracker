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
import type { Doctor } from "@/features/doctors/model/doctor";
import type { PageMeta } from "@/lib/api/types";

type DoctorTableProps = {
  items: Doctor[];
  meta?: PageMeta;
  onPageChange: (page: number) => void;
};

export function DoctorTable({ items, meta, onPageChange }: DoctorTableProps) {
  const total = meta?.total ?? items.length;
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? 20;
  const totalPages = meta?.totalPages ?? 1;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead className="text-right">Patients</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <Link className="font-semibold" href={`/doctors/${doctor.id}`}>
                    {doctor.name}
                  </Link>
                </TableCell>
                <TableCell>{doctor.specialization}</TableCell>
                <TableCell>{doctor.hospital}</TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell>{formatRecordDate(doctor.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="lg:hidden">
        {items.map((doctor) => (
          <li className="border-b border-line py-4" key={doctor.id}>
            <Link className="font-semibold" href={`/doctors/${doctor.id}`}>
              {doctor.name}
            </Link>
            <p className="text-sm text-ink-secondary">Specialization {doctor.specialization}</p>
            <p className="text-sm text-ink-secondary">Hospital {doctor.hospital}</p>
            <p className="text-sm text-ink-secondary">
              Created {formatRecordDate(doctor.createdAt)}
            </p>
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

function formatRecordDate(iso: string): string {
  try {
    const date = Temporal.Instant.from(iso).toZonedDateTimeISO("UTC").toPlainDate();
    const month = date.toLocaleString("en-GB", { month: "short" });
    return `${date.day} ${month} ${date.year}`;
  } catch {
    return iso;
  }
}
