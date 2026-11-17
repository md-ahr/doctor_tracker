import { expect, test } from "vitest";

import { doctorFormSchema } from "@/features/doctors/model/doctor-schema";

const doctor = {
  name: "Amelia Rahman",
  specialization: "Cardiology",
  hospital: "City General",
  phone: "+1 202 555 0148",
  email: "Amelia@CityGeneral.example",
};

test("trims the fields and lowercases the email", () => {
  const parsed = doctorFormSchema.safeParse({
    ...doctor,
    name: "  Amelia Rahman  ",
    hospital: " City General ",
  });

  expect(parsed.success).toBe(true);
  if (parsed.success) {
    expect(parsed.data).toEqual({ ...doctor, email: "amelia@citygeneral.example" });
  }
});

test("rejects an empty name, a bad email, and a phone outside the pattern", () => {
  expect(doctorFormSchema.safeParse({ ...doctor, name: "   " }).success).toBe(false);
  expect(doctorFormSchema.safeParse({ ...doctor, email: "not-an-email" }).success).toBe(false);
  expect(doctorFormSchema.safeParse({ ...doctor, phone: "call-me" }).success).toBe(false);
  expect(doctorFormSchema.safeParse({ ...doctor, specialization: "a".repeat(81) }).success).toBe(
    false,
  );
});
