import { QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import type { Patient } from "@/features/patients/model/patient";
import { PatientTable } from "@/features/patients/ui/patient-table";
import { createQueryClient } from "@/lib/query/query-client";

const patient: Patient = {
  id: "pat-1",
  doctorId: "665f1c0a2b3c4d5e6f708193",
  doctorName: "Amelia Rahman",
  fullName: "Noah Khan",
  dateOfBirth: "1984-04-12",
  sex: "male",
  phone: "+1 202 555 0199",
  email: "noah@example.com",
  condition: "stable",
  notes: null,
  registeredAt: "2026-11-16T00:00:00.000Z",
  createdAt: "2026-11-16T08:00:00.000Z",
  updatedAt: "2026-11-16T08:00:00.000Z",
};

afterEach(() => {
  cleanup();
});

test("condition mark includes the visible condition word", () => {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <PatientTable
        items={[patient]}
        meta={{ page: 1, limit: 20, total: 1, totalPages: 1 }}
        onEdit={() => undefined}
        onPageChange={() => undefined}
        showDoctor
      />
    </QueryClientProvider>,
  );

  const mark = screen.getAllByText("Stable")[0];
  expect(mark).toBeDefined();
  expect(mark?.tagName).not.toBe("BUTTON");
  expect(screen.getAllByRole("link", { name: "Amelia Rahman" }).length).toBeGreaterThan(0);
});
