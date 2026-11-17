import { z } from "zod";

import { PATIENT_CONDITIONS, type Sex } from "@/features/patients/model/patient";

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone")
  .max(20, "Enter a valid phone")
  .regex(/^\+?[0-9]+(?:[ -][0-9]+)*$/, "Enter a valid phone");

function isPlainDate(value: string): boolean {
  try {
    return Temporal.PlainDate.from(value).toString() === value;
  } catch {
    return false;
  }
}

function isValidDateOfBirth(value: string): boolean {
  if (value.length === 0) return true;
  if (!isPlainDate(value)) return false;
  const dob = Temporal.PlainDate.from(value);
  const today = Temporal.Now.plainDateISO();
  if (Temporal.PlainDate.compare(dob, today) > 0) return false;
  const oldest = today.subtract({ years: 130 });
  return Temporal.PlainDate.compare(dob, oldest) >= 0;
}

export const patientFormSchema = z.object({
  fullName: z.string().trim().min(1, "Enter a name").max(120, "Enter a name"),
  condition: z.enum(PATIENT_CONDITIONS, { error: "Choose a condition" }),
  doctorId: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^[a-fA-F0-9]{24}$/.test(value), "Choose a doctor"),
  registeredAt: z.string().trim().refine(isPlainDate, "Enter a registration date"),
  dateOfBirth: z.string().trim().refine(isValidDateOfBirth, "Enter a valid date of birth"),
  sex: z.enum(["", "female", "male", "other", "undisclosed"]),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || phoneSchema.safeParse(value).success,
      "Enter a valid phone",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => value.length === 0 || z.string().email().max(254).safeParse(value).success,
      "Enter a valid email",
    ),
  notes: z.string().trim().max(2000, "Enter notes under 2,000 characters"),
});

export const assignedPatientFormSchema = patientFormSchema.safeExtend({
  doctorId: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "Choose a doctor"),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
export type AssignedPatientFormValues = z.infer<typeof assignedPatientFormSchema>;

export type PatientSexValue = "" | Sex;
