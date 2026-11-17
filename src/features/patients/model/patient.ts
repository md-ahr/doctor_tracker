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
  critical: { label: "Critical", ink: "#8E2F2A", wash: "#F8E8E6" },
  serious: { label: "Serious", ink: "#8A4B12", wash: "#F8EEDF" },
  observation: { label: "Observation", ink: "#2C4A6E", wash: "#E6EDF5" },
  stable: { label: "Stable", ink: "#145C4A", wash: "#E5F2ED" },
  recovering: { label: "Recovering", ink: "#3E5A14", wash: "#EEF3E0" },
  chronic: { label: "Chronic", ink: "#5C3D55", wash: "#F3EAF0" },
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
}
