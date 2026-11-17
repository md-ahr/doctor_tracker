"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { patientApi } from "@/features/patients/api/patient-api";
import type { NewPatientInput, PatientPatch } from "@/lib/api/doctor-tracker-api";

async function invalidatePatientWrites(queryClient: QueryClient, doctorIds: string[]) {
  await queryClient.invalidateQueries({ queryKey: ["patients"] });
  for (const doctorId of doctorIds) {
    await queryClient.invalidateQueries({ queryKey: ["doctors", doctorId] });
  }
  await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { doctorId: string; body: NewPatientInput }) =>
      patientApi.createUnderDoctor(input.doctorId, input.body),
    onSuccess: async (_patient, input) => {
      await invalidatePatientWrites(queryClient, [input.doctorId]);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; doctorId: string; patch: PatientPatch }) =>
      patientApi.update(input.id, input.patch),
    onSuccess: async (_patient, input) => {
      const doctorIds = [input.doctorId];
      if (input.patch.doctorId && input.patch.doctorId !== input.doctorId) {
        doctorIds.push(input.patch.doctorId);
      }
      await invalidatePatientWrites(queryClient, doctorIds);
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; doctorId: string }) => patientApi.delete(input.id),
    onSuccess: async (_result, input) => {
      await invalidatePatientWrites(queryClient, [input.doctorId]);
    },
  });
}
