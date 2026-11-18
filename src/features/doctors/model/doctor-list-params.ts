import type { DoctorFilterValue } from "@/features/doctors/model/doctor-filter-schema";
import { doctorFilterFields } from "@/features/doctors/model/doctor-filter-schema";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/paging";
import { isDateOrderValid } from "@/lib/time/calendar";
import { readField, readPage, readPageSize } from "@/lib/url-state/list-params";

export type DoctorListParams = {
  filters: DoctorFilterValue;
  page: number;
  limit: PageSize;
};

function readDateRange(
  params: URLSearchParams,
): Pick<DoctorFilterValue, "createdFrom" | "createdTo"> {
  const createdFrom = readField(doctorFilterFields.createdFrom, params.get("createdFrom"), "");
  const createdTo = readField(doctorFilterFields.createdTo, params.get("createdTo"), "");

  if (createdFrom.length === 0 || createdTo.length === 0) return { createdFrom, createdTo };
  if (!isDateOrderValid(createdFrom, createdTo)) return { createdFrom: "", createdTo: "" };

  return { createdFrom, createdTo };
}

/** Turns the URL into the list query. Unknown or invalid values fall back to defaults. */
export function readDoctorListParams(params: URLSearchParams): DoctorListParams {
  return {
    filters: {
      q: readField(doctorFilterFields.q, params.get("q"), ""),
      specialization: readField(
        doctorFilterFields.specialization,
        params.get("specialization"),
        "",
      ),
      hospital: readField(doctorFilterFields.hospital, params.get("hospital"), ""),
      ...readDateRange(params),
    },
    page: readPage(params.get("page")),
    limit: readPageSize(params.get("limit"), PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE),
  };
}

/** Defaults are left out so the URL only carries what the admin changed. */
export function writeDoctorListParams({
  filters,
  page,
  limit,
}: DoctorListParams): Record<string, string | number | undefined> {
  return {
    q: filters.q || undefined,
    specialization: filters.specialization || undefined,
    hospital: filters.hospital || undefined,
    createdFrom: filters.createdFrom || undefined,
    createdTo: filters.createdTo || undefined,
    page: page > FIRST_PAGE ? page : undefined,
    limit: limit === DEFAULT_PAGE_SIZE ? undefined : limit,
  };
}
