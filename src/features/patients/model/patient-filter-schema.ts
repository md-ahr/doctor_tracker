import { z } from "zod";

import { PATIENT_CONDITIONS } from "@/features/patients/model/patient";
import { isDateOrderValid, isPlainDate } from "@/lib/time/calendar";

export const patientFilterFields = {
  q: z.string().trim().max(100, "Search is too long"),
  condition: z.union([z.literal(""), z.enum(PATIENT_CONDITIONS)]),
  doctorId: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^[a-fA-F0-9]{24}$/.test(value), "Choose a doctor"),
  registeredFrom: z.string().trim().refine(isPlainDate, "Enter a valid date"),
  registeredTo: z.string().trim().refine(isPlainDate, "Enter a valid date"),
};

export const patientFilterSchema = z.object(patientFilterFields).superRefine((value, ctx) => {
  if (value.registeredFrom.length === 0 || value.registeredTo.length === 0) return;
  if (isDateOrderValid(value.registeredFrom, value.registeredTo)) return;
  ctx.addIssue({
    code: "custom",
    message: "From is after To",
    path: ["registeredTo"],
  });
});

export type PatientFilterValues = z.infer<typeof patientFilterSchema>;

export const EMPTY_PATIENT_FILTERS: PatientFilterValues = {
  q: "",
  condition: "",
  doctorId: "",
  registeredFrom: "",
  registeredTo: "",
};

export function hasPatientFilters(filters: PatientFilterValues): boolean {
  return Object.values(filters).some((value) => value.length > 0);
}

export function countPatientFilters(filters: PatientFilterValues): number {
  return Object.values(filters).filter((value) => value.length > 0).length;
}
