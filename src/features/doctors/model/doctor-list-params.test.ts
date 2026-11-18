import { expect, test } from "vitest";

import { EMPTY_DOCTOR_FILTERS } from "@/features/doctors/model/doctor-filter-schema";
import {
  readDoctorListParams,
  writeDoctorListParams,
} from "@/features/doctors/model/doctor-list-params";

test("falls back to the directory defaults", () => {
  expect(readDoctorListParams(new URLSearchParams())).toEqual({
    filters: EMPTY_DOCTOR_FILTERS,
    page: 1,
    limit: 15,
  });
});

test("reads the filters and paging from the URL", () => {
  const params = new URLSearchParams({
    q: "  Amelia ",
    specialization: "Cardiology",
    hospital: "City General",
    createdFrom: "2026-11-01",
    createdTo: "2026-11-30",
    page: "3",
    limit: "50",
  });

  expect(readDoctorListParams(params)).toEqual({
    filters: {
      q: "Amelia",
      specialization: "Cardiology",
      hospital: "City General",
      createdFrom: "2026-11-01",
      createdTo: "2026-11-30",
    },
    page: 3,
    limit: 50,
  });
});

test("drops a reversed date range and keeps the rest", () => {
  const params = new URLSearchParams({
    q: "Amelia",
    createdFrom: "2026-11-30",
    createdTo: "2026-11-01",
  });

  expect(readDoctorListParams(params).filters).toEqual({ ...EMPTY_DOCTOR_FILTERS, q: "Amelia" });
});

test("ignores values the screen does not offer", () => {
  const params = new URLSearchParams({
    createdFrom: "2026-02-30",
    createdTo: "soon",
    page: "-4",
    limit: "999",
  });

  expect(readDoctorListParams(params)).toEqual({
    filters: EMPTY_DOCTOR_FILTERS,
    page: 1,
    limit: 15,
  });
});

test("leaves defaults out of the URL", () => {
  expect(writeDoctorListParams({ filters: EMPTY_DOCTOR_FILTERS, page: 1, limit: 15 })).toEqual({
    q: undefined,
    specialization: undefined,
    hospital: undefined,
    createdFrom: undefined,
    createdTo: undefined,
    page: undefined,
    limit: undefined,
  });
});

test("writes only what the admin changed", () => {
  expect(
    writeDoctorListParams({
      filters: { ...EMPTY_DOCTOR_FILTERS, q: "Amelia", hospital: "City General" },
      page: 4,
      limit: 30,
    }),
  ).toEqual({
    q: "Amelia",
    specialization: undefined,
    hospital: "City General",
    createdFrom: undefined,
    createdTo: undefined,
    page: 4,
    limit: 30,
  });
});

test("round-trips a written URL back into the same state", () => {
  const state = {
    filters: {
      q: "Amelia",
      specialization: "Cardiology",
      hospital: "",
      createdFrom: "2026-11-01",
      createdTo: "",
    },
    page: 2,
    limit: 30 as const,
  };
  const written = writeDoctorListParams(state);
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(written)) {
    if (value !== undefined) params.set(key, String(value));
  }

  expect(readDoctorListParams(params)).toEqual(state);
});
