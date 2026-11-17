"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreatePatient } from "@/features/patients/hooks/use-patient-mutations";
import {
  patientFormSchema,
  type PatientFormValues,
} from "@/features/patients/model/patient-schema";
import {
  applyApiError,
  PatientFields,
  toNewPatientInput,
} from "@/features/patients/ui/patient-form";

const emptyValues = {
  fullName: "",
  condition: "",
  doctorId: "",
  registeredAt: "",
  dateOfBirth: "",
  sex: "",
  phone: "",
  email: "",
  notes: "",
} as unknown as PatientFormValues;

type PatientCreateDialogProps = {
  doctorId: string;
  doctorName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function PatientCreateDialog({
  doctorId,
  doctorName,
  open,
  onOpenChange,
}: PatientCreateDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : uncontrolledOpen;
  const createPatient = useCreatePatient();
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: emptyValues,
  });

  function setDialogOpen(next: boolean) {
    if (createPatient.isPending) return;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
    if (next) form.reset(emptyValues);
  }

  async function onSubmit(values: PatientFormValues) {
    try {
      await createPatient.mutateAsync({ doctorId, body: toNewPatientInput(values) });
      form.reset(emptyValues);
      if (!isControlled) setUncontrolledOpen(false);
      onOpenChange?.(false);
    } catch (error) {
      applyApiError(error, form);
    }
  }

  const description = doctorName
    ? `This patient will be assigned to ${doctorName}.`
    : "This patient will be assigned to this doctor.";
  const rootError = form.formState.errors.root?.message;

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger className={buttonVariants()}>Add patient</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add patient</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <PatientFields doctors={[]} form={form} includeDoctor={false} />
          {rootError ? (
            <p
              className="mt-4 rounded-sm border border-danger-text/40 bg-danger-wash px-4 py-3 text-sm text-danger-text"
              role="alert"
            >
              {rootError}
            </p>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={createPatient.isPending} type="submit">
              {createPatient.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
