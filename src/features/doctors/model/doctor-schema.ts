import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone")
  .max(20, "Enter a valid phone")
  .regex(/^\+?[0-9]+(?:[ -][0-9]+)*$/, "Enter a valid phone");

export const doctorFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(120, "Enter a name"),
  specialization: z
    .string()
    .trim()
    .min(1, "Enter a specialization")
    .max(80, "Enter a specialization"),
  hospital: z.string().trim().min(1, "Enter a hospital").max(120, "Enter a hospital"),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .max(254, "Enter a valid email"),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
