"use client";

import { useQuery } from "@tanstack/react-query";

import { doctorApi } from "@/features/doctors/api/doctor-api";

export function useDoctorFacets() {
  return useQuery({
    queryKey: ["doctors", "facets"],
    queryFn: () => doctorApi.facets(),
  });
}
