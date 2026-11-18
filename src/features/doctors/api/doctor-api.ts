import type { Dashboard } from "@/lib/api/dashboard-types";
import {
  createDoctor,
  doctorFacets,
  getDashboard,
  getDoctor,
  listDoctors,
  updateDoctor,
  type DoctorListQuery,
  type DoctorPatch,
} from "@/lib/api/doctor-tracker-api";

export const doctorApi = {
  list: (query: DoctorListQuery) => listDoctors(query),
  create: createDoctor,
  facets: doctorFacets,
  get: getDoctor,
  update: (id: string, patch: DoctorPatch) => updateDoctor(id, patch),
  /** The list resource has no counts, so read them from the dashboard aggregate. */
  patientCounts: () => getDashboard().then(toPatientCounts),
};

function toPatientCounts(dashboard: Dashboard): Record<string, number> {
  return Object.fromEntries(
    dashboard.patientsPerDoctor.map(({ doctorId, patientCount }) => [doctorId, patientCount]),
  );
}
