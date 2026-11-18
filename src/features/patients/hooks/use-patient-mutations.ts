"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { patientApi } from "@/features/patients/api/patient-api";
import type { NewPatientInput, PatientPatch } from "@/lib/api/doctor-tracker-api";
import { notifyError, notifySuccess } from "@/lib/toast";

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
      notifySuccess("Patient added", `${input.body.fullName} was added to the directory.`);
      await invalidatePatientWrites(queryClient, [input.doctorId]);
    },
    onError: (error) => {
      notifyError("Could not add patient", error, "The patient could not be added.");
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; doctorId: string; patch: PatientPatch }) =>
      patientApi.update(input.id, input.patch),
    onSuccess: async (_patient, input) => {
      notifySuccess("Patient updated", "The patient record was saved.");
      const doctorIds = [input.doctorId];
      if (input.patch.doctorId && input.patch.doctorId !== input.doctorId) {
        doctorIds.push(input.patch.doctorId);
      }
      await invalidatePatientWrites(queryClient, doctorIds);
    },
    onError: (error) => {
      notifyError("Could not save patient", error, "The patient could not be saved.");
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; doctorId: string; fullName?: string }) =>
      patientApi.delete(input.id),
    onSuccess: async (_result, input) => {
      notifySuccess("Patient deleted", `${input.fullName ?? "The patient"} was removed.`);
      await invalidatePatientWrites(queryClient, [input.doctorId]);
    },
    onError: (error) => {
      notifyError("Could not delete patient", error, "The patient could not be deleted.");
    },
  });
}
