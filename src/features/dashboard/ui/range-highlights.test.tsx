import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { RangeHighlights } from "@/features/dashboard/ui/range-highlights";

test("summarises the range and the active roster from the dashboard payload", () => {
  render(
    <RangeHighlights
      conditions={[
        { condition: "stable", patientCount: 8 },
        { condition: "critical", patientCount: 2 },
      ]}
      doctors={[
        {
          doctorId: "doc-1",
          name: "Amelia Rahman",
          specialization: "Cardiology",
          patientCount: 6,
        },
        {
          doctorId: "doc-2",
          name: "Bilal Khan",
          specialization: "Cardiology",
          patientCount: 4,
        },
      ]}
      patients={[
        { date: "2026-11-02", count: 2 },
        { date: "2026-11-03", count: 4 },
        { date: "2026-11-04", count: 0 },
      ]}
    />,
  );

  expect(screen.getByRole("heading", { name: "Range at a glance" })).toBeTruthy();
  expect(screen.getByText("3 Nov")).toBeTruthy();
  expect(screen.getByText("4 registrations")).toBeTruthy();
  expect(screen.getByText("2 active days in range")).toBeTruthy();
  expect(screen.getByText("2 of 2")).toBeTruthy();
  expect(screen.getByText("Cardiology")).toBeTruthy();
  expect(screen.getByText("Stable")).toBeTruthy();
  expect(screen.getByText("8 patients · 80%")).toBeTruthy();
});

test("shows an empty state when the payload carries no records", () => {
  render(<RangeHighlights conditions={[]} doctors={[]} patients={[]} />);

  expect(screen.getByText("Nothing to summarise yet")).toBeTruthy();
  expect(screen.getByText("Add a doctor and a patient to see the range summary.")).toBeTruthy();
});
