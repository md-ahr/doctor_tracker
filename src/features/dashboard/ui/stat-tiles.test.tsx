import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import type { Dashboard } from "@/features/dashboard/model/dashboard";
import { StatTiles } from "@/features/dashboard/ui/stat-tiles";

const data: Dashboard = {
  range: { from: "2026-10-20", to: "2026-11-18", timezone: "UTC" },
  totals: { doctors: 12, patients: 148 },
  patientsPerDoctor: [],
  patientsByCondition: [],
  patientsRegisteredByDay: [
    { date: "2026-11-17", count: 4 },
    { date: "2026-11-18", count: 1 },
  ],
  doctorsCreatedByDay: [
    { date: "2026-11-17", count: 1 },
    { date: "2026-11-18", count: 0 },
  ],
};

test("renders the four figures from the dashboard totals and series", () => {
  render(<StatTiles data={data} />);

  expect(screen.getByText("Doctors").nextElementSibling?.textContent).toBe("12");
  expect(screen.getByText("Patients").nextElementSibling?.textContent).toBe("148");
  expect(screen.getByText("Registered").nextElementSibling?.textContent).toBe("5");
  expect(screen.getByText("Doctors added").nextElementSibling?.textContent).toBe("1");

  for (const value of ["12", "148", "5", "1"]) {
    expect(screen.getByText(value).className).toContain("tabular-nums");
    expect(screen.getByText(value).className).toContain("text-[40px]");
  }
});
