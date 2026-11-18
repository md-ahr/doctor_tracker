import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { RegistrationTrendChart } from "@/features/dashboard/ui/registration-trend-chart";

afterEach(() => {
  cleanup();
});

test("shows empty copy when the selected range has no registrations", () => {
  render(
    <RegistrationTrendChart
      patients={[
        { date: "2026-11-17", count: 0 },
        { date: "2026-11-18", count: 0 },
      ]}
    />,
  );

  expect(screen.getByText("No registrations yet")).toBeTruthy();
  expect(screen.queryByText("7-day average")).toBeNull();
});

test("draws the daily bars and the trailing average for a populated range", () => {
  render(
    <RegistrationTrendChart
      patients={[
        { date: "2026-11-17", count: 2 },
        { date: "2026-11-18", count: 4 },
      ]}
    />,
  );

  expect(screen.queryByText("No registrations yet")).toBeNull();
  expect(screen.getByText("7-day average")).toBeTruthy();
  expect(screen.getByText("6 in range")).toBeTruthy();
  expect(screen.getAllByText("17 Nov").length).toBeGreaterThan(0);
  expect(screen.getAllByText("18 Nov").length).toBeGreaterThan(0);
});
