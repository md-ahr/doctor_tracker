import {
  createDoctor,
  doctorFacets,
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
};
