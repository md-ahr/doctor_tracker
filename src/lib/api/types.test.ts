import { expect, test } from "vitest";

import { ApiError } from "@/lib/api/types";

test("ApiError exposes status, code, and details", () => {
  const details = [{ path: "email", message: "Invalid email" }];
  const error = new ApiError(422, "VALIDATION_ERROR", "Check the form", details);

  expect(error).toBeInstanceOf(Error);
  expect(error.name).toBe("ApiError");
  expect(error.message).toBe("Check the form");
  expect(error.status).toBe(422);
  expect(error.code).toBe("VALIDATION_ERROR");
  expect(error.details).toEqual(details);
});
