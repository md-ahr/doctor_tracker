import { z } from "zod";

import { isDateOrderValid, isPlainDate } from "@/lib/time/calendar";

export const doctorFilterFields = {
  q: z.string().trim().max(100, "Search is too long"),
  specialization: z.string().trim().max(80, "Specialization is too long"),
  hospital: z.string().trim().max(120, "Hospital is too long"),
  createdFrom: z.string().trim().refine(isPlainDate, "Enter a valid date"),
  createdTo: z.string().trim().refine(isPlainDate, "Enter a valid date"),
};

export const doctorFilterSchema = z.object(doctorFilterFields).superRefine((value, ctx) => {
  if (value.createdFrom.length === 0 || value.createdTo.length === 0) return;
  if (isDateOrderValid(value.createdFrom, value.createdTo)) return;
  ctx.addIssue({
    code: "custom",
    message: "From is after To",
    path: ["createdTo"],
  });
});

export type DoctorFilterValue = z.infer<typeof doctorFilterSchema>;

export const EMPTY_DOCTOR_FILTERS: DoctorFilterValue = {
  q: "",
  specialization: "",
  hospital: "",
  createdFrom: "",
  createdTo: "",
};
