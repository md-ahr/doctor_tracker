"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { doctorApi } from "@/features/doctors/api/doctor-api";
import type { DoctorFormValues } from "@/features/doctors/model/doctor-schema";
import type { DoctorPatch } from "@/lib/api/doctor-tracker-api";
import { notifyError, notifySuccess } from "@/lib/toast";

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DoctorFormValues) => doctorApi.create(input),
    onSuccess: async (_doctor, input) => {
      notifySuccess("Doctor added", `${input.name} is now in the directory.`);
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      notifyError("Could not add doctor", error, "The doctor could not be added.");
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; patch: DoctorPatch }) =>
      doctorApi.update(input.id, input.patch),
    onSuccess: async () => {
      notifySuccess("Doctor updated", "The directory entry was saved.");
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      notifyError("Could not save doctor", error, "The doctor could not be saved.");
    },
  });
}
