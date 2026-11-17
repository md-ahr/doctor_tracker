import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(() => {
  cleanup();
});

import { RegistrationChart } from "@/features/dashboard/ui/registration-chart";

const days = [
  { date: "2026-11-17", count: 0 },
  { date: "2026-11-18", count: 0 },
];

test("shows empty copy when every daily count is zero", () => {
  render(<RegistrationChart doctors={days} patients={days} />);

  expect(screen.getByText("Nothing registered in this range")).toBeTruthy();
  expect(screen.queryByRole("img")).toBeNull();
});

test("draws the shared date axis when a day has a registration", () => {
  render(
    <RegistrationChart
      doctors={days}
      patients={[
        { date: "2026-11-17", count: 0 },
        { date: "2026-11-18", count: 4 },
      ]}
    />,
  );

  expect(screen.queryByText("Nothing registered in this range")).toBeNull();
  expect(screen.getByText("2026-11-17")).toBeTruthy();
  expect(screen.getByText("2026-11-18")).toBeTruthy();
});
