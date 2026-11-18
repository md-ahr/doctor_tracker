"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, type ComponentProps } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdatePatient } from "@/features/patients/hooks/use-patient-mutations";
import {
  CONDITION_MARKS,
  PATIENT_CONDITIONS,
  type DoctorOption,
  type Patient,
} from "@/features/patients/model/patient";
import {
  assignedPatientFormSchema,
  patientFormSchema,
  type PatientFormValues,
} from "@/features/patients/model/patient-schema";
import type { NewPatientInput, PatientPatch } from "@/lib/api/doctor-tracker-api";
import { ApiError } from "@/lib/api/types";
import { toPlainDate } from "@/lib/time/calendar";

const fieldClass =
  "h-(--control-height) w-full rounded-(--radius-control) border border-control bg-sheet px-3 font-sans text-[13px] text-ink outline-none focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-danger aria-invalid:bg-danger-wash";

const sexOptions = [
  { value: "", label: "Not recorded" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Unknown" },
] as const;

const formFields = [
  "fullName",
  "condition",
  "doctorId",
  "registeredAt",
  "dateOfBirth",
  "sex",
  "phone",
  "email",
  "notes",
] as const;

type PatientFieldsProps = {
  form: UseFormReturn<PatientFormValues>;
  includeDoctor: boolean;
  doctors: DoctorOption[];
  currentDoctor?: DoctorOption;
};

export function PatientFields({ form, includeDoctor, doctors, currentDoctor }: PatientFieldsProps) {
  const doctorOptions =
    currentDoctor && !doctors.some((doctor) => doctor.id === currentDoctor.id)
      ? [currentDoctor, ...doctors]
      : doctors;
  const errors = form.formState.errors;

  return (
    <div className="mt-5 flex flex-col gap-4">
      <TextField
        autoFocus
        error={errors.fullName?.message}
        label="Full name"
        placeholder="Noah Khan"
        required
        {...form.register("fullName")}
      />
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="patient-condition" optional={false}>
          Condition
        </FieldLabel>
        <select
          aria-describedby={errors.condition ? "patient-condition-error" : undefined}
          aria-invalid={errors.condition ? true : undefined}
          className={fieldClass}
          id="patient-condition"
          {...form.register("condition")}
        >
          <option value="">Choose a condition</option>
          {PATIENT_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {CONDITION_MARKS[condition].label}
            </option>
          ))}
        </select>
        <FieldMessage id="patient-condition-error" message={errors.condition?.message} />
      </div>
      {includeDoctor ? (
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="patient-doctor" optional={false}>
            Doctor
          </FieldLabel>
          <select
            aria-describedby={errors.doctorId ? "patient-doctor-error" : undefined}
            aria-invalid={errors.doctorId ? true : undefined}
            className={fieldClass}
            id="patient-doctor"
            {...form.register("doctorId")}
          >
            <option value="">Choose a doctor</option>
            {doctorOptions.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
          <FieldMessage id="patient-doctor-error" message={errors.doctorId?.message} />
        </div>
      ) : null}
      <TextField
        error={errors.registeredAt?.message}
        label="Registered"
        required
        type="date"
        {...form.register("registeredAt")}
      />
      <TextField
        error={errors.dateOfBirth?.message}
        label="Date of birth"
        type="date"
        {...form.register("dateOfBirth")}
      />
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="patient-sex" optional>
          Sex
        </FieldLabel>
        <select className={fieldClass} id="patient-sex" {...form.register("sex")}>
          {sexOptions.map((option) => (
            <option key={option.value || "none"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <TextField
        error={errors.phone?.message}
        label="Phone"
        placeholder="+1 202 555 0199"
        {...form.register("phone")}
      />
      <TextField
        error={errors.email?.message}
        label="Email"
        placeholder="noah@example.com"
        type="email"
        {...form.register("email")}
      />
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="patient-notes" optional>
          Notes
        </FieldLabel>
        <textarea
          aria-describedby={errors.notes ? "patient-notes-error" : undefined}
          aria-invalid={errors.notes ? true : undefined}
          className="max-h-[200px] min-h-24 w-full rounded-(--radius-control) border border-control bg-sheet px-3 py-3 font-sans text-[13px] text-ink outline-none focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-danger aria-invalid:bg-danger-wash"
          id="patient-notes"
          {...form.register("notes")}
        />
        <FieldMessage id="patient-notes-error" message={errors.notes?.message} />
      </div>
    </div>
  );
}

type PatientFormDialogProps = {
  patient: Patient;
  open: boolean;
  doctors: DoctorOption[];
  includeDoctor: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PatientFormDialog({
  patient,
  open,
  doctors,
  includeDoctor,
  onOpenChange,
}: PatientFormDialogProps) {
  const updatePatient = useUpdatePatient();
  const schema = useMemo(
    () => (includeDoctor ? assignedPatientFormSchema : patientFormSchema),
    [includeDoctor],
  );
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(patient),
  });

  function setOpen(next: boolean) {
    if (updatePatient.isPending) return;
    if (next) form.reset(toFormValues(patient));
    onOpenChange(next);
  }

  async function onSubmit(values: PatientFormValues) {
    const patch = toPatientPatch(values, patient, includeDoctor);
    if (!patch) {
      onOpenChange(false);
      return;
    }
    try {
      await updatePatient.mutateAsync({ id: patient.id, doctorId: patient.doctorId, patch });
      onOpenChange(false);
    } catch (error) {
      applyApiError(error, form);
    }
  }

  const rootError = form.formState.errors.root?.message;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit patient</DialogTitle>
          <DialogDescription>Update this patient&apos;s record.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <PatientFields
            currentDoctor={{ id: patient.doctorId, name: patient.doctorName }}
            doctors={doctors}
            form={form}
            includeDoctor={includeDoctor}
          />
          {rootError ? (
            <p
              className="mt-4 rounded-xl border border-danger-text/30 bg-danger-wash px-4 py-3 text-xs text-danger-text"
              role="alert"
            >
              {rootError}
            </p>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={updatePatient.isPending} type="submit">
              {updatePatient.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function toFormValues(patient: Patient): PatientFormValues {
  return {
    fullName: patient.fullName,
    condition: patient.condition,
    doctorId: patient.doctorId,
    registeredAt: toPlainDate(patient.registeredAt),
    dateOfBirth: patient.dateOfBirth ?? "",
    sex: patient.sex ?? "",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    notes: patient.notes ?? "",
  };
}

export function toNewPatientInput(values: PatientFormValues): NewPatientInput {
  return {
    fullName: values.fullName,
    condition: values.condition,
    registeredAt: values.registeredAt,
    ...(values.dateOfBirth ? { dateOfBirth: values.dateOfBirth } : {}),
    ...(values.sex ? { sex: values.sex } : {}),
    ...(values.phone ? { phone: values.phone } : {}),
    ...(values.email ? { email: values.email } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
  };
}

export function toPatientPatch(
  values: PatientFormValues,
  patient: Patient,
  includeDoctor: boolean,
): PatientPatch | null {
  const patch: PatientPatch = {};
  if (values.fullName !== patient.fullName) patch.fullName = values.fullName;
  if (values.condition !== patient.condition) patch.condition = values.condition;
  if (values.registeredAt !== toPlainDate(patient.registeredAt)) {
    patch.registeredAt = values.registeredAt;
  }
  assignOptional(patch, "dateOfBirth", values.dateOfBirth, patient.dateOfBirth);
  assignOptional(patch, "sex", values.sex, patient.sex);
  assignOptional(patch, "phone", values.phone, patient.phone);
  assignOptional(patch, "email", values.email, patient.email);
  assignOptional(patch, "notes", values.notes, patient.notes);
  if (includeDoctor && values.doctorId !== patient.doctorId) patch.doctorId = values.doctorId;
  return Object.keys(patch).length === 0 ? null : patch;
}

export function applyApiError(error: unknown, form: UseFormReturn<PatientFormValues>) {
  if (!(error instanceof ApiError)) return;
  const known = new Set<string>(formFields);
  const fieldDetails = error.details.filter((detail) => known.has(detail.path));
  if (fieldDetails.length === 0) {
    form.setError("root", { message: error.message });
    return;
  }
  for (const detail of fieldDetails) {
    form.setError(detail.path as keyof PatientFormValues, { message: detail.message });
  }
}

function assignOptional<Key extends "dateOfBirth" | "sex" | "phone" | "email" | "notes">(
  patch: PatientPatch,
  key: Key,
  next: string,
  current: string | null,
) {
  const previous = current ?? "";
  if (next === previous) return;
  patch[key] = (next === "" ? null : next) as PatientPatch[Key];
}

function FieldLabel({
  htmlFor,
  optional = true,
  children,
}: {
  htmlFor: string;
  optional?: boolean;
  children: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <Label htmlFor={htmlFor}>{children}</Label>
      <span className="text-xs text-ink-tertiary">{optional ? "Optional" : "Required"}</span>
    </div>
  );
}

function FieldMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-danger-text" id={id}>
      {message}
    </p>
  );
}

function TextField({
  label,
  error,
  required = false,
  ...props
}: {
  label: string;
  error?: string;
  required?: boolean;
} & Omit<ComponentProps<typeof Input>, "required">) {
  const id = props.id ?? `patient-${label.toLowerCase().replaceAll(" ", "-")}`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id} optional={!required}>
        {label}
      </FieldLabel>
      <Input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        id={id}
        {...props}
      />
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}
