"use client";

import { useState } from "react";

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
import { TrashIcon } from "@/components/ui/icons";
import { useDeletePatient } from "@/features/patients/hooks/use-patient-mutations";
import type { Patient } from "@/features/patients/model/patient";
import { errorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";

type DeletePatientButtonProps = {
  patient: Pick<Patient, "id" | "doctorId" | "fullName">;
};

export function DeletePatientButton({ patient }: DeletePatientButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const remove = useDeletePatient();

  function setDialogOpen(next: boolean) {
    if (remove.isPending) return;
    setOpen(next);
    if (!next) setMessage(null);
  }

  async function onConfirm() {
    try {
      await remove.mutateAsync({
        id: patient.id,
        doctorId: patient.doctorId,
        fullName: patient.fullName,
      });
      setMessage(null);
      setOpen(false);
    } catch (error) {
      setMessage(errorMessage(error, "The patient could not be deleted."));
    }
  }

  return (
    <Dialog onOpenChange={setDialogOpen} open={open}>
      <DialogTrigger
        aria-label={`Delete ${patient.fullName}`}
        className={cn(buttonVariants({ variant: "dangerQuiet" }), "size-(--control-height) px-0")}
      >
        <TrashIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {patient.fullName}?</DialogTitle>
          <DialogDescription>
            They will disappear from lists, from their doctor, and from the counts. This cannot be
            undone here.
          </DialogDescription>
        </DialogHeader>
        {message ? (
          <p className="mt-4 text-sm text-danger-text" role="alert">
            {message}
          </p>
        ) : null}
        <DialogFooter>
          <Button autoFocus onClick={() => setDialogOpen(false)} type="button" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => void onConfirm()}
            type="button"
            variant="danger"
          >
            {remove.isPending ? "Saving…" : "Delete patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
