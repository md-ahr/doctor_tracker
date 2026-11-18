import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";

import type { PatientFilterValues } from "@/features/patients/model/patient-filter-schema";
import { PatientFilters } from "@/features/patients/ui/patient-filters";
import { currentMonthDay, pickDay } from "@/test/date-picker";

const value: PatientFilterValues = {
  q: "",
  condition: "",
  doctorId: "",
  registeredFrom: "",
  registeredTo: "",
};

const doctorId = "665f1c0a2b3c4d5e6f708193";

afterEach(() => {
  cleanup();
});

function Harness({
  initial,
  showDoctorFilter,
  onApply,
  onReset,
}: {
  initial: PatientFilterValues;
  showDoctorFilter: boolean;
  onApply: (next: PatientFilterValues) => void;
  onReset: () => void;
}) {
  const [applied, setApplied] = useState(initial);

  return (
    <PatientFilters
      applied={applied}
      doctors={[{ id: doctorId, name: "Amelia Rahman" }]}
      onApply={(next) => {
        setApplied(next);
        onApply(next);
      }}
      onReset={() => {
        setApplied(value);
        onReset();
      }}
      showDoctorFilter={showDoctorFilter}
    />
  );
}

function renderFilters(
  options: { initial?: PatientFilterValues; showDoctorFilter?: boolean } = {},
) {
  const onApply = vi.fn();
  const onReset = vi.fn();
  render(
    <Harness
      initial={options.initial ?? value}
      onApply={onApply}
      onReset={onReset}
      showDoctorFilter={options.showDoctorFilter ?? true}
    />,
  );
  return { onApply, onReset };
}

function isDisabled(name: string): boolean {
  return screen.getByRole("button", { name }).hasAttribute("disabled");
}

test("applies typed search only after the Apply button is pressed", async () => {
  const user = userEvent.setup();
  const { onApply } = renderFilters();

  await user.type(screen.getByRole("textbox", { name: "Search" }), "no");

  expect(onApply).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Apply" }));

  expect(onApply).toHaveBeenCalledWith({ ...value, q: "no" });
});

test("lists conditions from most acute to long-term and applies one", async () => {
  const user = userEvent.setup();
  const { onApply } = renderFilters();

  await user.click(screen.getByRole("combobox", { name: "Condition" }));

  const labels = (await screen.findAllByRole("option")).map((option) => option.textContent);
  expect(labels).toEqual([
    "Any",
    "Critical",
    "Serious",
    "Observation",
    "Stable",
    "Recovering",
    "Chronic",
  ]);

  await user.click(screen.getByRole("option", { name: "Chronic" }));
  await user.click(screen.getByRole("button", { name: "Apply" }));

  expect(onApply).toHaveBeenCalledWith({ ...value, condition: "chronic" });
});

test("applies a doctor choice on Apply", async () => {
  const user = userEvent.setup();
  const { onApply } = renderFilters();

  await user.click(screen.getByRole("combobox", { name: "Doctor" }));
  await user.click(await screen.findByRole("option", { name: "Amelia Rahman" }));
  await user.click(screen.getByRole("button", { name: "Apply" }));

  expect(onApply).toHaveBeenCalledWith({ ...value, doctorId });
});

test("keeps condition and dates but hides the doctor filter on a doctor page", () => {
  renderFilters({ showDoctorFilter: false });

  expect(screen.getByRole("combobox", { name: "Condition" })).toBeDefined();
  expect(screen.queryByRole("combobox", { name: "Doctor" })).toBeNull();
  expect(screen.getByRole("button", { name: "From date" })).toBeDefined();
  expect(screen.getByRole("button", { name: "To date" })).toBeDefined();
});

test("applies condition and dates without a doctor filter on a doctor page", async () => {
  const user = userEvent.setup();
  const { onApply } = renderFilters({ showDoctorFilter: false });

  await user.click(screen.getByRole("combobox", { name: "Condition" }));
  await user.click(await screen.findByRole("option", { name: "Stable" }));

  await pickDay(user, "From", currentMonthDay(1));
  await pickDay(user, "To", currentMonthDay(10));
  await user.click(screen.getByRole("button", { name: "Apply" }));
  expect(onApply).toHaveBeenCalledWith({
    ...value,
    condition: "stable",
    registeredFrom: currentMonthDay(1),
    registeredTo: currentMonthDay(10),
  });
});

test("reset clears the draft and reports the reset", async () => {
  const user = userEvent.setup();
  const { onApply, onReset } = renderFilters({ initial: { ...value, q: "noah" } });

  await user.click(screen.getByRole("button", { name: "Reset" }));

  expect(onReset).toHaveBeenCalledTimes(1);
  expect(onApply).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox", { name: "Search" })).toHaveProperty("value", "");
  expect(isDisabled("Apply")).toBe(true);
});

test("follows applied values that change outside the form", () => {
  const props = {
    doctors: [{ id: doctorId, name: "Amelia Rahman" }],
    onApply: vi.fn(),
    onReset: vi.fn(),
    showDoctorFilter: true,
  };
  const { rerender } = render(<PatientFilters applied={value} {...props} />);

  expect(screen.getByRole("textbox", { name: "Search" })).toHaveProperty("value", "");

  rerender(<PatientFilters applied={{ ...value, q: "noah" }} {...props} />);

  expect(screen.getByRole("textbox", { name: "Search" })).toHaveProperty("value", "noah");
  expect(isDisabled("Apply")).toBe(true);
});
