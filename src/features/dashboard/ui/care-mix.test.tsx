import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { CareMix } from "@/features/dashboard/ui/care-mix";

test("splits active patients into quiet and watched care groups", () => {
  render(
    <CareMix
      conditions={[
        { condition: "stable", patientCount: 6 },
        { condition: "recovering", patientCount: 2 },
        { condition: "critical", patientCount: 1 },
        { condition: "observation", patientCount: 1 },
      ]}
    />,
  );

  expect(screen.getByRole("heading", { name: "Care mix" })).toBeTruthy();
  expect(screen.getByText("Stable & recovering")).toBeTruthy();
  expect(screen.getByText("Critical & watch")).toBeTruthy();
  expect(screen.getByText("8 · 80%")).toBeTruthy();
  expect(screen.getByText("2 · 20%")).toBeTruthy();
});

test("shows the empty copy when no patients are active", () => {
  render(<CareMix conditions={[]} />);

  expect(screen.getByText("No patients yet")).toBeTruthy();
  expect(
    screen.getByText("Patients appear here as soon as the directory has active records."),
  ).toBeTruthy();
});
