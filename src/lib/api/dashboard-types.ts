export type PatientCondition =
  "critical" | "serious" | "stable" | "recovering" | "chronic" | "observation";

export interface DashboardDayPoint {
  date: string;
  count: number;
}

export interface Dashboard {
  range: { from: string; to: string; timezone: string };
  totals: { doctors: number; patients: number };
  patientsPerDoctor: Array<{
    doctorId: string;
    name: string;
    specialization: string;
    patientCount: number;
  }>;
  patientsByCondition: Array<{ condition: PatientCondition; patientCount: number }>;
  patientsRegisteredByDay: DashboardDayPoint[];
  doctorsCreatedByDay: DashboardDayPoint[];
}
