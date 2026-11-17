import { clearAccessToken, setAccessToken } from "@/lib/auth/access-token";

import type { Dashboard } from "./dashboard-types";
import { apiRequest } from "./http-client";
import type { PageMeta } from "./types";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  expiresIn: number;
  admin: AdminProfile;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorDetail extends Doctor {
  activePatientCount: number;
}

export interface DoctorListQuery {
  q?: string;
  specialization?: string;
  hospital?: string;
  createdFrom?: string;
  createdTo?: string;
  page: number;
  limit: number;
  sort: "createdAt" | "name";
}

export type DoctorPatch = Partial<
  Pick<Doctor, "name" | "specialization" | "hospital" | "phone" | "email">
>;

export type PatientCondition =
  "critical" | "serious" | "stable" | "recovering" | "chronic" | "observation";

export type Sex = "female" | "male" | "other" | "undisclosed";

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

export interface PatientListQuery {
  q?: string;
  condition?: PatientCondition;
  doctorId?: string;
  registeredFrom?: string;
  registeredTo?: string;
  page: number;
  limit: number;
  sort: "registeredAt" | "fullName";
}

export interface NewPatientInput {
  fullName: string;
  condition: PatientCondition;
  dateOfBirth?: string;
  sex?: Sex;
  phone?: string;
  email?: string;
  notes?: string;
  registeredAt?: string;
}

export type PatientPatch = {
  fullName?: string;
  dateOfBirth?: string | null;
  sex?: Sex | null;
  phone?: string | null;
  email?: string | null;
  condition?: PatientCondition;
  notes?: string | null;
  registeredAt?: string;
  doctorId?: string;
};

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

function queryString(query: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}

export async function login(input: { email: string; password: string }) {
  const body = await apiRequest<AuthSession>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(body.data.accessToken);
  return body.data;
}

export async function refresh() {
  const body = await apiRequest<AuthSession>("/api/v1/auth/refresh", {
    method: "POST",
  });
  setAccessToken(body.data.accessToken);
  return body.data;
}

export async function logout() {
  await apiRequest<null>("/api/v1/auth/logout", { method: "POST" });
  clearAccessToken();
}

export async function me() {
  const body = await apiRequest<AdminProfile>("/api/v1/auth/me");
  return body.data;
}

export async function listDoctors(query: DoctorListQuery): Promise<Page<Doctor>> {
  const body = await apiRequest<Doctor[]>(`/api/v1/doctors${queryString(query)}`);
  return { items: body.data, meta: body.meta as PageMeta };
}

export async function createDoctor(input: {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}) {
  const body = await apiRequest<Doctor>("/api/v1/doctors", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return body.data;
}

export async function doctorFacets() {
  const body = await apiRequest<{ specializations: string[]; hospitals: string[] }>(
    "/api/v1/doctors/facets",
  );
  return body.data;
}

export async function getDoctor(id: string) {
  const body = await apiRequest<DoctorDetail>(`/api/v1/doctors/${encodeURIComponent(id)}`);
  return body.data;
}

export async function updateDoctor(id: string, patch: DoctorPatch) {
  const body = await apiRequest<Doctor>(`/api/v1/doctors/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return body.data;
}

export async function listDoctorPatients(
  doctorId: string,
  query: Omit<PatientListQuery, "doctorId">,
): Promise<Page<Patient>> {
  const body = await apiRequest<Patient[]>(
    `/api/v1/doctors/${encodeURIComponent(doctorId)}/patients${queryString(query)}`,
  );
  return { items: body.data, meta: body.meta as PageMeta };
}

export async function createPatientUnderDoctor(doctorId: string, input: NewPatientInput) {
  const body = await apiRequest<Patient>(
    `/api/v1/doctors/${encodeURIComponent(doctorId)}/patients`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return body.data;
}

export async function listPatients(query: PatientListQuery): Promise<Page<Patient>> {
  const body = await apiRequest<Patient[]>(`/api/v1/patients${queryString(query)}`);
  return { items: body.data, meta: body.meta as PageMeta };
}

export async function updatePatient(id: string, patch: PatientPatch) {
  const body = await apiRequest<Patient>(`/api/v1/patients/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return body.data;
}

export async function deletePatient(id: string): Promise<void> {
  await apiRequest<null>(`/api/v1/patients/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getDashboard(range: { from?: string; to?: string } = {}) {
  const body = await apiRequest<Dashboard>(`/api/v1/dashboard${queryString(range)}`);
  return body.data;
}
