import type { DoctorOption } from "@/features/patients/model/patient";

/** Shape accepted by `SearchableSelect` for the doctor pickers. */
export type DoctorSelectOption = {
  value: string;
  label: string;
  /** Secondary line that tells same-named doctors apart. */
  description?: string;
};

/**
 * Builds doctor picker options from the directory.
 *
 * The directory can contain several doctors with the same name, which reads as duplicated rows
 * once the name is the only text in the option. Shared names get a specialization and hospital
 * hint. When even that detail is shared, every row for that name uses the doctor's email instead,
 * which is unique, so no two options read the same. Duplicate ids are collapsed too, which keeps
 * the list stable when directory pages overlap.
 */
export function toDoctorSelectOptions(doctors: DoctorOption[]): DoctorSelectOption[] {
  const unique = new Map<string, DoctorOption>();
  for (const doctor of doctors) {
    if (!unique.has(doctor.id)) unique.set(doctor.id, doctor);
  }

  const groups = new Map<string, { count: number; details: Set<string> }>();
  for (const doctor of unique.values()) {
    const key = nameKey(doctor.name);
    const group = groups.get(key) ?? { count: 0, details: new Set<string>() };
    group.count += 1;
    group.details.add(practiceDetail(doctor));
    groups.set(key, group);
  }

  const needsIdentity = new Set<string>();
  for (const [name, group] of groups) {
    if (group.count > 1 && group.details.size < group.count) needsIdentity.add(name);
  }

  return Array.from(unique.values(), (doctor) => {
    const name = nameKey(doctor.name);
    if ((groups.get(name)?.count ?? 0) < 2) {
      return { value: doctor.id, label: doctor.name };
    }

    const description = needsIdentity.has(name) ? identityDetail(doctor) : practiceDetail(doctor);

    return description.length > 0
      ? { value: doctor.id, label: doctor.name, description }
      : { value: doctor.id, label: doctor.name };
  });
}

function practiceDetail(doctor: DoctorOption): string {
  return [doctor.specialization, doctor.hospital].filter(Boolean).join(" · ");
}

/** Email first, so a truncated row still tells two otherwise identical doctors apart. */
function identityDetail(doctor: DoctorOption): string {
  if (!doctor.email) return practiceDetail(doctor);
  return [doctor.email, doctor.specialization].filter(Boolean).join(" · ");
}

function nameKey(name: string): string {
  return name.trim().toLowerCase();
}
