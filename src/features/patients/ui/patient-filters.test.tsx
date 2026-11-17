import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import type { PatientFilterValues } from "@/features/patients/model/patient-filter-schema";
import { PatientFilters } from "@/features/patients/ui/patient-filters";

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
  vi.useRealTimers();
});

test("does not apply search until 300ms have passed", async () => {
  vi.useFakeTimers();
  const onChange = vi.fn();

  render(
    <PatientFilters
      dateError={false}
      doctors={[{ id: doctorId, name: "Amelia Rahman" }]}
      onChange={onChange}
      showDirectoryFilters
      value={value}
    />,
  );

  fireEvent.change(screen.getByRole("textbox", { name: "Search" }), { target: { value: "no" } });

  expect(onChange).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(299);
  expect(onChange).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1);
  expect(onChange).toHaveBeenCalledWith({ ...value, q: "no" });
});

test("lists conditions from most acute to long-term and hides them on a doctor page", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <PatientFilters
      dateError={false}
      doctors={[{ id: doctorId, name: "Amelia Rahman" }]}
      onChange={onChange}
      showDirectoryFilters
      value={value}
    />,
  );

  const labels = [
    ...screen.getByRole("combobox", { name: "Condition" }).querySelectorAll("option"),
  ].map((option) => option.textContent);
  expect(labels).toEqual([
    "Any",
    "Critical",
    "Serious",
    "Observation",
    "Stable",
    "Recovering",
    "Chronic",
  ]);

  await user.selectOptions(screen.getByRole("combobox", { name: "Doctor" }), doctorId);
  expect(onChange).toHaveBeenCalledWith({ ...value, doctorId });

  rerender(
    <PatientFilters
      dateError={false}
      doctors={[]}
      onChange={onChange}
      showDirectoryFilters={false}
      value={value}
    />,
  );

  expect(screen.queryByRole("combobox", { name: "Condition" })).toBeNull();
  expect(screen.queryByRole("combobox", { name: "Doctor" })).toBeNull();
});
