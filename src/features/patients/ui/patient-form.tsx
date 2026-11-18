"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, type ComponentProps, type ReactNode } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdatePatient } from "@/features/patients/hooks/use-patient-mutations";
import { toDoctorSelectOptions } from "@/features/patients/model/doctor-options";
import {
  CONDITION_MARKS,
  PATIENT_CONDITIONS,
  type DoctorOption,
  type Patient,
  type PatientCondition,
} from "@/features/patients/model/patient";
import {
  assignedPatientFormSchema,
  patientFormSchema,
  type PatientFormValues,
} from "@/features/patients/model/patient-schema";
import type { NewPatientInput, PatientPatch } from "@/lib/api/doctor-tracker-api";
import { ApiError } from "@/lib/api/types";
import { toPlainDate } from "@/lib/time/calendar";
import { cn } from "@/lib/utils";

const conditionItems = PATIENT_CONDITIONS.map((condition) => ({
  label: CONDITION_MARKS[condition].label,
  value: condition,
}));

/** Select values are always strings, so "no choice" needs a sentinel. */
const SEX_UNSET = "unset";

const sexItems = [
  { value: SEX_UNSET, label: "Not recorded" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Unknown" },
] as const;

const textareaClass =
  "max-h-[200px] min-h-24 w-full rounded-(--radius-control) border border-control bg-sheet px-3 py-3 font-sans text-[13px] text-ink transition-colors duration-150 outline-none placeholder:text-ink-tertiary focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-danger aria-invalid:bg-danger-wash";

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
  const doctorItems = toDoctorSelectOptions(doctorOptions);
  const errors = form.formState.errors;

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <TextField
        autoFocus
        className="sm:col-span-2"
        error={errors.fullName?.message}
        id="patient-full-name"
        label="Full name"
        placeholder="Noah Khan"
        required
        {...form.register("fullName")}
      />

      <Controller
        control={form.control}
        name="condition"
        render={({ field, fieldState }) => (
          <Field
            error={fieldState.error?.message}
            htmlFor="patient-condition"
            label="Condition"
            required
          >
            <Select<PatientCondition>
              items={conditionItems}
              modal={false}
              onValueChange={(value) => field.onChange(value ?? "")}
              value={field.value || null}
            >
              <SelectTrigger
                aria-describedby={fieldErrorId("patient-condition", fieldState.invalid)}
                aria-invalid={fieldState.invalid || undefined}
                id="patient-condition"
              >
                <SelectValue placeholder="Choose a condition" />
              </SelectTrigger>
              <SelectContent>
                {conditionItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {includeDoctor ? (
        <Controller
          control={form.control}
          name="doctorId"
          render={({ field, fieldState }) => (
            <Field
              error={fieldState.error?.message}
              htmlFor="patient-doctor"
              label="Doctor"
              required
            >
              <Select
                items={doctorItems}
                modal={false}
                onValueChange={(value) => field.onChange(value ?? "")}
                value={field.value || null}
              >
                <SelectTrigger
                  aria-describedby={fieldErrorId("patient-doctor", fieldState.invalid)}
                  aria-invalid={fieldState.invalid || undefined}
                  id="patient-doctor"
                >
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctorItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.description ? (
                        <span className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate">{item.label}</span>
                          <span className="truncate text-[11px] text-ink-tertiary">
                            {item.description}
                          </span>
                        </span>
                      ) : (
                        item.label
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      ) : null}

      <Controller
        control={form.control}
        name="registeredAt"
        render={({ field, fieldState }) => (
          <Field
            error={fieldState.error?.message}
            htmlFor="patient-registered"
            label="Registered"
            required
          >
            <DateField
              describedBy={fieldErrorId("patient-registered", fieldState.invalid)}
              id="patient-registered"
              invalid={fieldState.invalid}
              label="Registered"
              onChange={field.onChange}
              required
              size="field"
              value={field.value}
            />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="dateOfBirth"
        render={({ field, fieldState }) => (
          <Field
            error={fieldState.error?.message}
            htmlFor="patient-date-of-birth"
            label="Date of birth"
          >
            <DateField
              describedBy={fieldErrorId("patient-date-of-birth", fieldState.invalid)}
              id="patient-date-of-birth"
              invalid={fieldState.invalid}
              label="Date of birth"
              onChange={field.onChange}
              size="field"
              value={field.value}
            />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="sex"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} htmlFor="patient-sex" label="Sex">
            <Select
              items={sexItems}
              modal={false}
              onValueChange={(value) => field.onChange(value && value !== SEX_UNSET ? value : "")}
              value={field.value || SEX_UNSET}
            >
              <SelectTrigger
                aria-describedby={fieldErrorId("patient-sex", fieldState.invalid)}
                aria-invalid={fieldState.invalid || undefined}
                id="patient-sex"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sexItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <TextField
        error={errors.phone?.message}
        id="patient-phone"
        inputMode="tel"
        label="Phone"
        placeholder="+1 202 555 0199"
        {...form.register("phone")}
      />

      <TextField
        className={includeDoctor ? "sm:col-span-2" : undefined}
        error={errors.email?.message}
        id="patient-email"
        label="Email"
        placeholder="noah@example.com"
        type="email"
        {...form.register("email")}
      />

      <Field
        className="sm:col-span-2"
        error={errors.notes?.message}
        htmlFor="patient-notes"
        label="Notes"
      >
        <textarea
          aria-describedby={fieldErrorId("patient-notes", Boolean(errors.notes))}
          aria-invalid={errors.notes ? true : undefined}
          className={textareaClass}
          id="patient-notes"
          {...form.register("notes")}
        />
      </Field>
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

type FieldProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
};

function Field({ children, className, error, htmlFor, label, required = false }: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-danger-text" id={fieldErrorId(htmlFor, true)}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function fieldErrorId(id: string, hasError: boolean) {
  return hasError ? `${id}-error` : undefined;
}

type TextFieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Input>, "id" | "required">;

function TextField({ id, label, error, required = false, className, ...props }: TextFieldProps) {
  return (
    <Field className={className} error={error} htmlFor={id} label={label} required={required}>
      <Input
        aria-describedby={fieldErrorId(id, Boolean(error))}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        id={id}
        {...props}
      />
    </Field>
  );
}
