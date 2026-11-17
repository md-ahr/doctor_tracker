"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { doctorApi } from "@/features/doctors/api/doctor-api";
import type { DoctorFormValues } from "@/features/doctors/model/doctor-schema";
import type { DoctorPatch } from "@/lib/api/doctor-tracker-api";

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DoctorFormValues) => doctorApi.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; patch: DoctorPatch }) =>
      doctorApi.update(input.id, input.patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
