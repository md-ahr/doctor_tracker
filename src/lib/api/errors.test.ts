import { expect, test } from "vitest";

import { isMissingRecordError } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/types";

test("a 404 means the record is gone", () => {
  expect(isMissingRecordError(new ApiError(404, "DOCTOR_NOT_FOUND", "gone"))).toBe(true);
  expect(isMissingRecordError(new ApiError(404, "PATIENT_NOT_FOUND", "gone"))).toBe(true);
});

test("a rejected id is treated as missing because no retry can fix it", () => {
  expect(isMissingRecordError(new ApiError(400, "VALIDATION_ERROR", "bad id"))).toBe(true);
});

test("everything else stays an ordinary error", () => {
  expect(isMissingRecordError(new ApiError(401, "UNAUTHENTICATED", "Sign in"))).toBe(false);
  expect(isMissingRecordError(new ApiError(500, "INTERNAL", "boom"))).toBe(false);
  expect(isMissingRecordError(new Error("boom"))).toBe(false);
  expect(isMissingRecordError(null)).toBe(false);
});
