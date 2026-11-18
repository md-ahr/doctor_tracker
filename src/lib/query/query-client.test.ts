import { expect, test } from "vitest";

import { ApiError } from "@/lib/api/types";
import { createQueryClient } from "@/lib/query/query-client";

function retryWith(error: Error, failureCount = 0) {
  const retry = createQueryClient().getDefaultOptions().queries?.retry;
  if (typeof retry !== "function") throw new Error("retry must be a function");

  return retry(failureCount, error);
}

test("uses the shared query defaults", () => {
  const client = createQueryClient();

  expect(client.getDefaultOptions().queries).toMatchObject({
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
});

test("retries a transient failure once and never a missing record", () => {
  const serverError = new ApiError(500, "INTERNAL", "Something went wrong");

  expect(retryWith(serverError)).toBe(true);
  expect(retryWith(serverError, 1)).toBe(false);

  expect(retryWith(new ApiError(404, "DOCTOR_NOT_FOUND", "gone"))).toBe(false);
  expect(retryWith(new ApiError(400, "VALIDATION_ERROR", "bad id"))).toBe(false);
});
