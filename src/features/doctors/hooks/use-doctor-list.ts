"use client";

import { useQuery } from "@tanstack/react-query";

import { doctorApi } from "@/features/doctors/api/doctor-api";
import type { DoctorListQuery } from "@/lib/api/doctor-tracker-api";

export function useDoctorList(query: DoctorListQuery) {
  return useQuery({
    queryKey: ["doctors", query],
    queryFn: () => doctorApi.list(query),
  });
}
