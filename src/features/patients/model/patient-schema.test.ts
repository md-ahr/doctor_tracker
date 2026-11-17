import { expect, test } from "vitest";

import { patientFilterSchema } from "@/features/patients/model/patient-filter-schema";
import {
  assignedPatientFormSchema,
  patientFormSchema,
} from "@/features/patients/model/patient-schema";

const doctorId = "665f1c0a2b3c4d5e6f708193";

const patient = {
  fullName: "Noah Khan",
  condition: "stable" as const,
  doctorId: "",
  registeredAt: "2026-11-16",
  dateOfBirth: "1984-04-12",
  sex: "male" as const,
  phone: "+1 202 555 0199",
  email: "Noah@Example.com",
  notes: "Registered from the cardiology clinic.",
};

const filters = {
  q: "Noah",
  condition: "critical" as const,
  doctorId,
  registeredFrom: "2026-11-01",
  registeredTo: "2026-11-16",
};

test("trims the name and lowercases the email", () => {
  const parsed = patientFormSchema.safeParse({
    ...patient,
    fullName: "  Noah Khan  ",
    notes: "  Clinic note  ",
  });

  expect(parsed.success).toBe(true);
  if (parsed.success) {
    expect(parsed.data.fullName).toBe("Noah Khan");
    expect(parsed.data.email).toBe("noah@example.com");
    expect(parsed.data.notes).toBe("Clinic note");
  }
});

test("allows a patient without optional contact fields", () => {
  const parsed = patientFormSchema.safeParse({
    ...patient,
    dateOfBirth: "",
    sex: "",
    phone: "",
    email: "",
    notes: "",
  });

  expect(parsed.success).toBe(true);
});

test("rejects an empty name, a bad phone, a future birth date, and notes over 2,000 characters", () => {
  expect(patientFormSchema.safeParse({ ...patient, fullName: "   " }).success).toBe(false);
  expect(patientFormSchema.safeParse({ ...patient, phone: "call-me" }).success).toBe(false);
  expect(patientFormSchema.safeParse({ ...patient, email: "not-an-email" }).success).toBe(false);
  expect(patientFormSchema.safeParse({ ...patient, dateOfBirth: "2999-01-01" }).success).toBe(
    false,
  );
  expect(patientFormSchema.safeParse({ ...patient, dateOfBirth: "1800-01-01" }).success).toBe(
    false,
  );
  expect(patientFormSchema.safeParse({ ...patient, registeredAt: "2026-02-31" }).success).toBe(
    false,
  );
  expect(patientFormSchema.safeParse({ ...patient, notes: "a".repeat(2001) }).success).toBe(false);
  expect(patientFormSchema.safeParse({ ...patient, condition: "unknown" }).success).toBe(false);
});

test("requires a doctor id when the patient is assigned from the directory", () => {
  expect(assignedPatientFormSchema.safeParse(patient).success).toBe(false);
  expect(assignedPatientFormSchema.safeParse({ ...patient, doctorId }).success).toBe(true);
});

test("accepts a condition, doctor, and registration window", () => {
  const parsed = patientFilterSchema.safeParse(filters);

  expect(parsed.success).toBe(true);
  if (parsed.success) {
    expect(parsed.data).toEqual({ ...filters, q: "Noah" });
  }
});

test("rejects a search over 100 characters and a reversed date window", () => {
  expect(patientFilterSchema.safeParse({ ...filters, q: "n".repeat(101) }).success).toBe(false);
  expect(
    patientFilterSchema.safeParse({
      ...filters,
      registeredFrom: "2026-11-16",
      registeredTo: "2026-11-01",
    }).success,
  ).toBe(false);
  expect(patientFilterSchema.safeParse({ ...filters, condition: "asleep" }).success).toBe(false);
  expect(patientFilterSchema.safeParse({ ...filters, doctorId: "doc-1" }).success).toBe(false);
});
