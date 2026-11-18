import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, expect, test, vi } from "vitest";

import { DateField } from "@/components/ui/date-field";
import { currentMonthDay, pickDay } from "@/test/date-picker";

afterEach(() => {
  cleanup();
});

function renderField(props: Partial<ComponentProps<typeof DateField>> = {}) {
  const onChange = vi.fn();

  render(<DateField id="patient-from" label="From" onChange={onChange} value="" {...props} />);

  return { onChange };
}

test("shows a placeholder and opens the calendar popover", async () => {
  const user = userEvent.setup();
  renderField();

  expect(screen.getByRole("button", { name: "From date" }).textContent).toContain("Select date");
  expect(screen.queryByRole("grid")).toBeNull();

  await user.click(screen.getByRole("button", { name: "From date" }));

  expect(screen.getByRole("grid")).toBeDefined();
  expect(screen.getByRole("button", { name: "Today" })).toBeDefined();
});

test("reports the chosen day as a canonical plain date", async () => {
  const user = userEvent.setup();
  const { onChange } = renderField();

  await pickDay(user, "From", currentMonthDay(15));

  expect(onChange).toHaveBeenCalledWith(currentMonthDay(15));
});

test("selects today from the footer shortcut", async () => {
  const user = userEvent.setup();
  const { onChange } = renderField();

  await user.click(screen.getByRole("button", { name: "From date" }));
  await user.click(screen.getByRole("button", { name: "Today" }));

  expect(onChange).toHaveBeenCalledWith(currentMonthDay(new Date().getDate()));
});

test("clears the selected date from the field", async () => {
  const user = userEvent.setup();
  const { onChange } = renderField({ value: "2026-11-18" });

  expect(screen.getByRole("button", { name: "From date" }).textContent).toContain("18 Nov 2026");

  await user.click(screen.getByRole("button", { name: "Clear from date" }));

  expect(onChange).toHaveBeenCalledWith("");
});

test("clears the selected date from the popover footer", async () => {
  const user = userEvent.setup();
  const { onChange } = renderField({ value: "2026-11-18" });

  await user.click(screen.getByRole("button", { name: "From date" }));
  await user.click(screen.getByRole("button", { name: "Clear" }));

  expect(onChange).toHaveBeenCalledWith("");
});

test("marks the field as invalid when the range is reversed", () => {
  renderField({ describedBy: "patient-date-error", invalid: true, value: "2026-11-18" });

  const trigger = screen.getByRole("button", { name: "From date" });

  expect(trigger.getAttribute("aria-invalid")).toBe("true");
  expect(trigger.getAttribute("aria-describedby")).toBe("patient-date-error");
});
