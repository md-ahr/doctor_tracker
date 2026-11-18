import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import type { Doctor } from "@/features/doctors/model/doctor";
import { DoctorTable } from "@/features/doctors/ui/doctor-table";
import { createQueryClient } from "@/lib/query/query-client";

const doctor: Doctor = {
  id: "doc-1",
  name: "Amelia Rahman",
  specialization: "Cardiology",
  hospital: "City General",
  phone: "+880 1711 000000",
  email: "amelia@example.com",
  createdAt: "2026-11-16T08:00:00.000Z",
  updatedAt: "2026-11-16T08:00:00.000Z",
};

afterEach(() => {
  cleanup();
});

function renderTable(patientCounts?: Record<string, number>) {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <DoctorTable
        items={[doctor]}
        limit={15}
        meta={{ page: 1, limit: 15, total: 1, totalPages: 1 }}
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
        patientCounts={patientCounts}
      />
    </QueryClientProvider>,
  );
}

test("shows each doctor's active patient count", () => {
  renderTable({ "doc-1": 12 });

  const count = screen.getAllByText("12")[0];
  expect(count).toBeDefined();
  expect(count?.className).toContain("text-right");
  expect(count?.className).toContain("tabular-nums");
});

test("shows a zero count rather than a placeholder", () => {
  renderTable({ "doc-1": 0 });

  expect(screen.getAllByText("0").length).toBeGreaterThan(0);
});

test("treats a loaded aggregate without the doctor as zero patients", () => {
  renderTable({ "doc-2": 5 });

  expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  expect(screen.queryByText("—")).toBeNull();
});

test("shows a placeholder while the counts are unknown", () => {
  renderTable();

  expect(screen.getAllByText("—").length).toBeGreaterThan(0);
});

test("keeps the count header right aligned over its column", () => {
  renderTable({ "doc-1": 12 });

  const header = screen.getAllByText("Patients")[0];
  expect(header?.className).toContain("text-right");
});

test("keeps the full hospital name reachable when the cell truncates", () => {
  renderTable({ "doc-1": 12 });

  expect(screen.getByTitle("City General").textContent).toBe("City General");
});

test("pins the created date and its header to the right edge", () => {
  renderTable({ "doc-1": 12 });

  const header = screen.getAllByText("Created")[0];
  expect(header?.className).toContain("text-right");

  const cell = screen.getByText("16 Nov 2026", { selector: "td" });
  expect(cell.className).toContain("text-right");
  expect(cell.className).toContain("tabular-nums");
});
