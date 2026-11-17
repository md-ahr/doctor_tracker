"use client";

import { useQuery } from "@tanstack/react-query";

import { patientApi } from "@/features/patients/api/patient-api";
import type { PatientListQuery } from "@/lib/api/doctor-tracker-api";

export function usePatientList(query: PatientListQuery) {
  return useQuery({
    queryKey: ["patients", query],
    queryFn: () => patientApi.list(query),
  });
}

const doctorDirectoryKey = ["doctors", { sort: "name", limit: 50 }] as const;

export function useDoctorDirectory(enabled: boolean) {
  return useQuery({
    queryKey: doctorDirectoryKey,
    queryFn: () => patientApi.doctorOptions(),
    enabled,
  });
}
