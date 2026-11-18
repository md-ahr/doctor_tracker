import { expect, test } from "vitest";

import { errorMessage } from "@/lib/api/error-message";
import { ApiError } from "@/lib/api/types";

test("prefers a message authored by the server", () => {
  const error = new ApiError(409, "EMAIL_IN_USE", "That email is registered to another doctor");
  expect(errorMessage(error, "The doctor could not be added.")).toBe(
    "That email is registered to another doctor",
  );
});

test("replaces a raw error code with friendly copy", () => {
  const error = new ApiError(401, "INVALID_CREDENTIALS", "INVALID_CREDENTIALS");
  expect(errorMessage(error, "The sign-in request could not be completed.")).toBe(
    "The email or password is incorrect.",
  );
});

test("uses the fallback for an unknown code that has no message", () => {
  const error = new ApiError(409, "SOMETHING_NEW", "SOMETHING_NEW");
  expect(errorMessage(error, "The request could not be completed.")).toBe(
    "The request could not be completed.",
  );
});

test("maps an empty API message by code", () => {
  const error = new ApiError(500, "INTERNAL", "   ");
  expect(errorMessage(error, "The request could not be completed.")).toBe(
    "Something went wrong on the server. Please try again.",
  );
});

test("uses a plain Error message", () => {
  expect(errorMessage(new Error("Network is down"), "The request failed.")).toBe("Network is down");
});

test("falls back for non-error values", () => {
  expect(errorMessage("nope", "The request failed.")).toBe("The request failed.");
});
