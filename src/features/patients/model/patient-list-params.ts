import type { PatientFilterValues } from "@/features/patients/model/patient-filter-schema";
import { patientFilterFields } from "@/features/patients/model/patient-filter-schema";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/paging";
import { isDateOrderValid } from "@/lib/time/calendar";
import { readField, readPage, readPageSize } from "@/lib/url-state/list-params";

export type PatientListParams = {
  filters: PatientFilterValues;
  page: number;
  limit: PageSize;
};

export type PatientListScope = {
  /** A doctor page owns the doctor id, so only that filter is dropped from the URL. */
  doctorScoped: boolean;
};

function readDateRange(
  params: URLSearchParams,
): Pick<PatientFilterValues, "registeredFrom" | "registeredTo"> {
  const registeredFrom = readField(
    patientFilterFields.registeredFrom,
    params.get("registeredFrom"),
    "",
  );
  const registeredTo = readField(patientFilterFields.registeredTo, params.get("registeredTo"), "");

  if (registeredFrom.length === 0 || registeredTo.length === 0) {
    return { registeredFrom, registeredTo };
  }
  if (!isDateOrderValid(registeredFrom, registeredTo)) {
    return { registeredFrom: "", registeredTo: "" };
  }

  return { registeredFrom, registeredTo };
}

/** Turns the URL into the list query. Unknown or invalid values fall back to defaults. */
export function readPatientListParams(
  params: URLSearchParams,
  { doctorScoped }: PatientListScope,
): PatientListParams {
  const dateRange = readDateRange(params);

  return {
    filters: {
      q: readField(patientFilterFields.q, params.get("q"), ""),
      condition: readField(patientFilterFields.condition, params.get("condition"), ""),
      doctorId: doctorScoped
        ? ""
        : readField(patientFilterFields.doctorId, params.get("doctorId"), ""),
      ...dateRange,
    },
    page: readPage(params.get("page")),
    limit: readPageSize(params.get("limit"), PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE),
  };
}

/** Defaults are left out so the URL only carries what the admin changed. */
export function writePatientListParams(
  { filters, page, limit }: PatientListParams,
  { doctorScoped }: PatientListScope,
): Record<string, string | number | undefined> {
  return {
    q: filters.q || undefined,
    condition: filters.condition || undefined,
    doctorId: doctorScoped ? undefined : filters.doctorId || undefined,
    registeredFrom: filters.registeredFrom || undefined,
    registeredTo: filters.registeredTo || undefined,
    page: page > FIRST_PAGE ? page : undefined,
    limit: limit === DEFAULT_PAGE_SIZE ? undefined : limit,
  };
}
