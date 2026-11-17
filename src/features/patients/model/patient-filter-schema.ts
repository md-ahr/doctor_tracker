import { z } from "zod";

import { PATIENT_CONDITIONS } from "@/features/patients/model/patient";
import { isDateOrderValid } from "@/lib/time/calendar";

function isPlainDate(value: string): boolean {
  if (value.length === 0) return true;
  try {
    return Temporal.PlainDate.from(value).toString() === value;
  } catch {
    return false;
  }
}

export const patientFilterSchema = z
  .object({
    q: z.string().trim().max(100, "Search is too long"),
    condition: z.union([z.literal(""), z.enum(PATIENT_CONDITIONS)]),
    doctorId: z
      .string()
      .trim()
      .refine((value) => value.length === 0 || /^[a-fA-F0-9]{24}$/.test(value), "Choose a doctor"),
    registeredFrom: z.string().trim().refine(isPlainDate, "Enter a valid date"),
    registeredTo: z.string().trim().refine(isPlainDate, "Enter a valid date"),
  })
  .superRefine((value, ctx) => {
    if (value.registeredFrom.length === 0 || value.registeredTo.length === 0) return;
    if (isDateOrderValid(value.registeredFrom, value.registeredTo)) return;
    ctx.addIssue({
      code: "custom",
      message: "From is after To",
      path: ["registeredTo"],
    });
  });

export type PatientFilterValues = z.infer<typeof patientFilterSchema>;
