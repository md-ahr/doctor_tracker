"use client";

import { useQuery } from "@tanstack/react-query";

import { doctorApi } from "@/features/doctors/api/doctor-api";

export function useDoctor(doctorId: string) {
  return useQuery({
    queryKey: ["doctors", doctorId],
    queryFn: () => doctorApi.get(doctorId),
    enabled: doctorId.length > 0,
  });
}
