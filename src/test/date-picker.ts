import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { expect } from "vitest";

/** Canonical `YYYY-MM-DD` for a day inside the month the calendar opens on. */
export function currentMonthDay(day: number): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${String(day).padStart(2, "0")}`;
}

/** Opens a `DateField` calendar by its visible label and picks a day cell. */
export async function pickDay(user: UserEvent, label: string, isoDate: string): Promise<void> {
  await user.click(screen.getByRole("button", { name: `${label} date` }));

  const button = document.querySelector<HTMLButtonElement>(`[data-day="${isoDate}"] button`);
  expect(button).not.toBeNull();

  await user.click(button as HTMLButtonElement);
}
