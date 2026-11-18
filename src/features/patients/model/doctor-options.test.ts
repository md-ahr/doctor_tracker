import { describe, expect, test } from "vitest";

import { toDoctorSelectOptions } from "@/features/patients/model/doctor-options";
import type { DoctorOption } from "@/features/patients/model/patient";

const cardiology = {
  specialization: "Cardiology",
  hospital: "Square Hospital, Dhaka",
} as const;

function doctor(id: string, name: string, extra: Partial<DoctorOption> = {}): DoctorOption {
  return { id, name, ...extra };
}

describe("toDoctorSelectOptions", () => {
  test("keeps one entry per doctor id", () => {
    const options = toDoctorSelectOptions([
      doctor("d1", "Amelia Rahman"),
      doctor("d1", "Amelia Rahman"),
      doctor("d2", "Arif Sarkar"),
    ]);

    expect(options.map((option) => option.value)).toEqual(["d1", "d2"]);
  });

  test("leaves a unique name as a single line", () => {
    const [option] = toDoctorSelectOptions([doctor("d1", "Amelia Rahman", cardiology)]);

    expect(option).toEqual({ value: "d1", label: "Amelia Rahman" });
  });

  test("hints at specialization and hospital when doctors share a name", () => {
    const options = toDoctorSelectOptions([
      doctor("d1", "Abdul Hasan", cardiology),
      doctor("d2", "Abdul Hasan", {
        specialization: "Neurology",
        hospital: "United Hospital, Gulshan",
      }),
    ]);

    expect(options).toEqual([
      {
        value: "d1",
        label: "Abdul Hasan",
        description: "Cardiology · Square Hospital, Dhaka",
      },
      {
        value: "d2",
        label: "Abdul Hasan",
        description: "Neurology · United Hospital, Gulshan",
      },
    ]);
  });

  test("treats names that differ only by case as shared", () => {
    const options = toDoctorSelectOptions([
      doctor("d1", "Abdul Hasan", cardiology),
      doctor("d2", "abdul hasan", cardiology),
    ]);

    expect(
      options.every((option) => option.description === "Cardiology · Square Hospital, Dhaka"),
    ).toBe(true);
  });

  test("puts a unique email first when name, specialization, and hospital all match", () => {
    const options = toDoctorSelectOptions([
      doctor("d1", "Abdul Hasan", { ...cardiology, email: "dr-002@seed.careguide.local" }),
      doctor("d2", "Abdul Hasan", { ...cardiology, email: "dr-022@seed.careguide.local" }),
    ]);

    expect(options.map((option) => option.description)).toEqual([
      "dr-002@seed.careguide.local · Cardiology",
      "dr-022@seed.careguide.local · Cardiology",
    ]);
  });

  test("uses email-first hints for every row when one detail repeats", () => {
    const options = toDoctorSelectOptions([
      doctor("d1", "Abdul Hasan", { ...cardiology, email: "dr-002@seed.careguide.local" }),
      doctor("d2", "Abdul Hasan", { ...cardiology, email: "dr-022@seed.careguide.local" }),
      doctor("d3", "Abdul Hasan", {
        specialization: "Neurology",
        hospital: "United Hospital, Gulshan",
        email: "dr-042@seed.careguide.local",
      }),
    ]);

    expect(options.map((option) => option.description)).toEqual([
      "dr-002@seed.careguide.local · Cardiology",
      "dr-022@seed.careguide.local · Cardiology",
      "dr-042@seed.careguide.local · Neurology",
    ]);
  });

  test("skips the hint when no detail is available", () => {
    const options = toDoctorSelectOptions([
      doctor("d1", "Abdul Hasan"),
      doctor("d2", "Abdul Hasan"),
    ]);

    expect(options).toEqual([
      { value: "d1", label: "Abdul Hasan" },
      { value: "d2", label: "Abdul Hasan" },
    ]);
  });
});
