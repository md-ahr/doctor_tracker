import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { DoctorFilters, type DoctorFilterValue } from "@/features/doctors/ui/doctor-filters";

const value: DoctorFilterValue = {
  q: "",
  specialization: "",
  hospital: "",
  createdFrom: "",
  createdTo: "",
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("does not apply search until 300ms have passed", async () => {
  vi.useFakeTimers();
  const onChange = vi.fn();

  render(
    <DoctorFilters
      dateError={false}
      facets={{ specializations: ["Cardiology"], hospitals: ["City General"] }}
      onChange={onChange}
      value={value}
    />,
  );

  fireEvent.change(screen.getByRole("textbox", { name: "Search" }), { target: { value: "am" } });

  expect(onChange).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(299);
  expect(onChange).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(1);
  expect(onChange).toHaveBeenCalledWith({ ...value, q: "am" });
});

test("applies a specialization choice immediately", async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();

  render(
    <DoctorFilters
      dateError={false}
      facets={{ specializations: ["Cardiology"], hospitals: ["City General"] }}
      onChange={onChange}
      value={value}
    />,
  );

  await user.selectOptions(screen.getByRole("combobox", { name: "Specialization" }), "Cardiology");

  expect(onChange).toHaveBeenCalledWith({ ...value, specialization: "Cardiology" });
});
