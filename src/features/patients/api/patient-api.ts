import type { DoctorOption } from "@/features/patients/model/patient";
import {
  createPatientUnderDoctor,
  deletePatient,
  listDoctors,
  listPatients,
  updatePatient,
  type NewPatientInput,
  type PatientListQuery,
  type PatientPatch,
} from "@/lib/api/doctor-tracker-api";

export const patientApi = {
  list: (query: PatientListQuery) => listPatients(query),
  update: (id: string, patch: PatientPatch) => updatePatient(id, patch),
  delete: (id: string) => deletePatient(id),
  createUnderDoctor: (doctorId: string, input: NewPatientInput) =>
    createPatientUnderDoctor(doctorId, input),
  doctorOptions: listDoctorOptions,
};

async function listDoctorOptions(): Promise<DoctorOption[]> {
  const first = await listDoctors({ page: 1, limit: 50, sort: "name" });
  const items = [...first.items];

  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await listDoctors({ page, limit: 50, sort: "name" });
    items.push(...next.items);
  }

  // Name-sorted pages can overlap when the directory changes between requests; keep one row per id.
  const byId = new Map(items.map((doctor) => [doctor.id, doctor]));

  return Array.from(byId.values(), (doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialization: doctor.specialization,
    hospital: doctor.hospital,
    email: doctor.email,
  }));
}
