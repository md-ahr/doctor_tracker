import { expect, test } from "vitest";

import { EMPTY_PATIENT_FILTERS } from "@/features/patients/model/patient-filter-schema";
import {
  readPatientListParams,
  writePatientListParams,
} from "@/features/patients/model/patient-list-params";

const doctorId = "665f1c0a2b3c4d5e6f708193";
const directory = { doctorScoped: false };
const scoped = { doctorScoped: true };

test("falls back to the registry defaults", () => {
  expect(readPatientListParams(new URLSearchParams(), directory)).toEqual({
    filters: EMPTY_PATIENT_FILTERS,
    page: 1,
    limit: 15,
  });
});

test("reads the directory filters and paging from the URL", () => {
  const params = new URLSearchParams({
    q: "  Noah ",
    condition: "stable",
    doctorId,
    registeredFrom: "2026-11-01",
    registeredTo: "2026-11-30",
    page: "2",
    limit: "30",
  });

  expect(readPatientListParams(params, directory)).toEqual({
    filters: {
      q: "Noah",
      condition: "stable",
      doctorId,
      registeredFrom: "2026-11-01",
      registeredTo: "2026-11-30",
    },
    page: 2,
    limit: 30,
  });
});

test("keeps condition and dates but drops the doctor on a doctor page", () => {
  const params = new URLSearchParams({
    q: "Noah",
    condition: "stable",
    doctorId,
    registeredFrom: "2026-11-01",
    registeredTo: "2026-11-30",
    page: "2",
  });

  expect(readPatientListParams(params, scoped)).toEqual({
    filters: {
      q: "Noah",
      condition: "stable",
      doctorId: "",
      registeredFrom: "2026-11-01",
      registeredTo: "2026-11-30",
    },
    page: 2,
    limit: 15,
  });
});

test("drops a reversed date range and keeps the rest", () => {
  const params = new URLSearchParams({
    q: "Noah",
    registeredFrom: "2026-11-30",
    registeredTo: "2026-11-01",
  });

  expect(readPatientListParams(params, directory).filters).toEqual({
    ...EMPTY_PATIENT_FILTERS,
    q: "Noah",
  });
});

test("ignores conditions and doctor ids the API would reject", () => {
  const params = new URLSearchParams({
    condition: "unknown",
    doctorId: "not-an-object-id",
    registeredFrom: "2026-13-01",
  });

  expect(readPatientListParams(params, directory).filters).toEqual(EMPTY_PATIENT_FILTERS);
});

test("writes only what the admin changed", () => {
  expect(
    writePatientListParams(
      {
        filters: { ...EMPTY_PATIENT_FILTERS, q: "Noah", condition: "stable" },
        page: 3,
        limit: 30,
      },
      directory,
    ),
  ).toEqual({
    q: "Noah",
    condition: "stable",
    doctorId: undefined,
    registeredFrom: undefined,
    registeredTo: undefined,
    page: 3,
    limit: 30,
  });
});

test("writes condition and dates but never the doctor on a doctor page", () => {
  expect(
    writePatientListParams(
      {
        filters: {
          ...EMPTY_PATIENT_FILTERS,
          q: "Noah",
          condition: "stable",
          doctorId,
          registeredFrom: "2026-11-01",
          registeredTo: "2026-11-30",
        },
        page: 1,
        limit: 15,
      },
      scoped,
    ),
  ).toEqual({
    q: "Noah",
    condition: "stable",
    doctorId: undefined,
    registeredFrom: "2026-11-01",
    registeredTo: "2026-11-30",
    page: undefined,
    limit: undefined,
  });
});

test("round-trips a written URL back into the same state", () => {
  const state = {
    filters: { ...EMPTY_PATIENT_FILTERS, q: "Noah", condition: "stable" as const },
    page: 2,
    limit: 30 as const,
  };
  const written = writePatientListParams(state, directory);
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(written)) {
    if (value !== undefined) params.set(key, String(value));
  }

  expect(readPatientListParams(params, directory)).toEqual(state);
});
