import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { PatientsByConditionChart } from "@/features/dashboard/ui/patients-by-condition-chart";
import { PatientsPerDoctorChart } from "@/features/dashboard/ui/patients-per-doctor-chart";

test("renders doctor and condition bars from sample series", () => {
  render(
    <>
      <PatientsPerDoctorChart
        doctors={[
          {
            doctorId: "doc-1",
            name: "Amelia Rahman",
            specialization: "Cardiology",
            patientCount: 20,
          },
        ]}
      />
      <PatientsByConditionChart
        conditions={[
          { condition: "stable", patientCount: 80 },
          { condition: "critical", patientCount: 0 },
        ]}
      />
    </>,
  );

  expect(screen.getByRole("heading", { name: "Patients per doctor" })).toBeTruthy();
  expect(screen.getByText("Amelia Rahman")).toBeTruthy();
  expect(screen.getByRole("heading", { name: "By condition" })).toBeTruthy();
  expect(screen.getAllByText("Critical").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Chronic").length).toBeGreaterThan(0);
});
