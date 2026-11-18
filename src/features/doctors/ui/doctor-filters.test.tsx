import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";

import { DoctorFilters, type DoctorFilterValue } from "@/features/doctors/ui/doctor-filters";
import { currentMonthDay, pickDay } from "@/test/date-picker";

const value: DoctorFilterValue = {
  q: "",
  specialization: "",
  hospital: "",
  createdFrom: "",
  createdTo: "",
};

afterEach(() => {
  cleanup();
});

function Harness({
  initial,
  onApply,
  onReset,
}: {
  initial: DoctorFilterValue;
  onApply: (next: DoctorFilterValue) => void;
  onReset: () => void;
}) {
  const [applied, setApplied] = useState(initial);

  return (
    <DoctorFilters
      applied={applied}
      facets={{ specializations: ["Cardiology"], hospitals: ["City General"] }}
      onApply={(next) => {
        setApplied(next);
        onApply(next);
      }}
      onReset={() => {
        setApplied(value);
        onReset();
      }}
    />
  );
}

function renderFilters(initial: DoctorFilterValue = value) {
  const onApply = vi.fn();
  const onReset = vi.fn();
  render(<Harness initial={initial} onApply={onApply} onReset={onReset} />);
  return { onApply, onReset };
}

function isDisabled(name: string): boolean {
  return screen.getByRole("button", { name }).hasAttribute("disabled");
}

test("applies typed search only after the Apply button is pressed", async () => {
  const user = userEvent.setup();
  const { onApply } = renderFilters();

  await user.type(screen.getByRole("textbox", { name: "Search" }), "am");

  expect(onApply).not.toHaveBeenCalled();
  expect(isDisabled("Apply")).toBe(false);

  await user.click(screen.getByRole("button", { name: "Apply" }));

  expect(onApply).toHaveBeenCalledWith({ ...value, q: "am" });
});

test("keeps Apply disabled until a filter changes", () => {
  renderFilters();

  expect(isDisabled("Apply")).toBe(true);
  expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
});

test("applies a specialization choice on Apply", async () => {
  const user = userEvent.setup();
  const { onApply } = renderFilters();

  await user.click(screen.getByRole("combobox", { name: "Specialization" }));
  await user.click(await screen.findByRole("option", { name: "Cardiology" }));
  await user.click(screen.getByRole("button", { name: "Apply" }));

  expect(onApply).toHaveBeenCalledWith({ ...value, specialization: "Cardiology" });
});

test("blocks Apply while the date range is reversed", async () => {
  const user = userEvent.setup();
  renderFilters();

  await pickDay(user, "From", currentMonthDay(10));
  await pickDay(user, "To", currentMonthDay(1));

  expect(screen.getByText("From is after To")).toBeDefined();
  expect(isDisabled("Apply")).toBe(true);
});

test("reset clears the draft and every applied filter", async () => {
  const user = userEvent.setup();
  const { onApply, onReset } = renderFilters({ ...value, q: "am", specialization: "Cardiology" });

  await user.click(screen.getByRole("button", { name: "Reset" }));

  expect(onReset).toHaveBeenCalledTimes(1);
  expect(onApply).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox", { name: "Search" })).toHaveProperty("value", "");
  expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
  expect(isDisabled("Apply")).toBe(true);
});

test("follows applied values that change outside the form", () => {
  const props = {
    facets: { specializations: [], hospitals: [] },
    onApply: vi.fn(),
    onReset: vi.fn(),
  };
  const { rerender } = render(<DoctorFilters applied={value} {...props} />);

  expect(screen.getByRole("textbox", { name: "Search" })).toHaveProperty("value", "");

  rerender(<DoctorFilters applied={{ ...value, q: "am" }} {...props} />);

  expect(screen.getByRole("textbox", { name: "Search" })).toHaveProperty("value", "am");
  expect(isDisabled("Apply")).toBe(true);
});
