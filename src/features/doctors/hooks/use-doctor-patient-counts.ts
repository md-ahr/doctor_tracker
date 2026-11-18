"use client";

import { useQuery } from "@tanstack/react-query";

import { doctorApi } from "@/features/doctors/api/doctor-api";

/**
 * Active patient counts keyed by doctor id.
 *
 * The doctor list resource omits `activePatientCount`, so the dashboard aggregate is
 * the source. It covers every doctor, including those with zero patients, and its
 * per-doctor counts ignore the dashboard window. The empty range asks the API for
 * its default window; only the counts are read here.
 */
export function useDoctorPatientCounts() {
  return useQuery({
    queryKey: ["dashboard", "", ""],
    queryFn: () => doctorApi.patientCounts(),
    staleTime: 60_000,
  });
}
