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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDoctor, useUpdateDoctor } from "@/features/doctors/hooks/use-doctor-mutations";
import { doctorFormSchema, type DoctorFormValues } from "@/features/doctors/model/doctor-schema";
import type { Doctor } from "@/features/doctors/model/doctor";
import { ApiError } from "@/lib/api/types";

const emptyValues: DoctorFormValues = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

const fields = [
  { name: "name", label: "Name", placeholder: "Amelia Rahman" },
  { name: "specialization", label: "Specialization", placeholder: "Cardiology" },
  { name: "hospital", label: "Hospital", placeholder: "City General" },
  { name: "phone", label: "Phone", placeholder: "+1 202 555 0148" },
  { name: "email", label: "Email", placeholder: "amelia@citygeneral.example" },
] as const;

type DoctorFormDialogProps = {
  doctor?: Pick<Doctor, "id" | "name" | "specialization" | "hospital" | "phone" | "email">;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DoctorFormDialog({ doctor, open, onOpenChange }: DoctorFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : uncontrolledOpen;
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const pending = createDoctor.isPending || updateDoctor.isPending;
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: doctor
      ? {
          name: doctor.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          phone: doctor.phone,
          email: doctor.email,
        }
      : emptyValues,
  });

  function setDialogOpen(next: boolean) {
    if (pending) return;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
    if (next) {
      form.reset(
        doctor
          ? {
              name: doctor.name,
              specialization: doctor.specialization,
              hospital: doctor.hospital,
              phone: doctor.phone,
              email: doctor.email,
            }
          : emptyValues,
      );
    }
  }

  async function onSubmit(values: DoctorFormValues) {
    try {
      if (doctor) {
        await updateDoctor.mutateAsync({ id: doctor.id, patch: values });
      } else {
        await createDoctor.mutateAsync(values);
      }
      form.reset(emptyValues);
      if (!isControlled) setUncontrolledOpen(false);
      onOpenChange?.(false);
    } catch (error) {
      if (!(error instanceof ApiError)) return;
      const known = fields.map((field) => field.name);
      const fieldDetails = error.details.filter((detail) =>
        known.includes(detail.path as (typeof fields)[number]["name"]),
      );
      if (fieldDetails.length === 0) {
        form.setError("root", { message: error.message });
        return;
      }
      for (const detail of fieldDetails) {
        form.setError(detail.path as keyof DoctorFormValues, { message: detail.message });
      }
    }
  }

  const title = doctor ? "Edit details" : "Add doctor";
  const rootError = form.formState.errors.root?.message;

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger className={buttonVariants({ variant: doctor ? "quiet" : "primary" })}>
        {title}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {doctor ? "Correct the directory entry." : "Add a doctor to the directory."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="mt-5 flex flex-col gap-4"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {fields.map((field) => {
            const error = form.formState.errors[field.name];
            const errorId = `${field.name}-error`;
            return (
              <div className="flex flex-col gap-1" key={field.name}>
                <div className="flex items-baseline justify-between">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <span className="text-xs text-ink-tertiary">Required</span>
                </div>
                <Input
                  aria-describedby={error ? errorId : undefined}
                  aria-invalid={error ? true : undefined}
                  autoFocus={field.name === "name" ? true : undefined}
                  id={field.name}
                  placeholder={field.placeholder}
                  type={field.name === "email" ? "email" : "text"}
                  {...form.register(field.name)}
                />
                {error ? (
                  <p className="text-xs text-danger-text" id={errorId}>
                    {error.message}
                  </p>
                ) : null}
              </div>
            );
          })}
          {rootError ? (
            <p
              className="rounded-sm border border-danger-text/40 bg-danger-wash px-4 py-3 text-sm text-danger-text"
              role="alert"
            >
              {rootError}
            </p>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
