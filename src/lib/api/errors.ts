import { ApiError } from "./types";

/**
 * True when a single-record read can never succeed: the API answered that the
 * record is gone (404), or rejected the id before it looked it up (400).
 *
 * Only use this for reads whose sole input is the record id. A list request
 * can also fail with 400 because of a filter, and that is not a missing record.
 */
export function isMissingRecordError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 404) return true;
  return error.status === 400 && error.code === "VALIDATION_ERROR";
}
