export const PATIENT_CONDITIONS = [
  "critical",
  "serious",
  "observation",
  "stable",
  "recovering",
  "chronic",
] as const;

export type PatientCondition = (typeof PATIENT_CONDITIONS)[number];

export type Sex = "female" | "male" | "other" | "undisclosed";

export const CONDITION_MARKS: Record<
  PatientCondition,
  { label: string; ink: string; wash: string }
> = {
  critical: { label: "Critical", ink: "#be123c", wash: "#ffe4e6" },
  serious: { label: "Serious", ink: "#b45309", wash: "#fef3c7" },
  observation: { label: "Observation", ink: "#4338ca", wash: "#eef2ff" },
  stable: { label: "Stable", ink: "#0f766e", wash: "#ccfbf1" },
  recovering: { label: "Recovering", ink: "#15803d", wash: "#dcfce7" },
  chronic: { label: "Chronic", ink: "#6d28d9", wash: "#f3e8ff" },
};

export interface Patient {
  id: string;
  doctorId: string;
  doctorName: string;
  fullName: string;
  dateOfBirth: string | null;
  sex: Sex | null;
  phone: string | null;
  email: string | null;
  condition: PatientCondition;
  notes: string | null;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorOption {
  id: string;
  name: string;
  /** Present when the option comes from the doctor directory; used to tell shared names apart. */
  specialization?: string;
  hospital?: string;
  email?: string;
}
