import { ApiError } from "./types";

/**
 * Server codes that should never reach the screen when the API sends no
 * human-readable message. The API falls back to the code as its message, so a
 * toast would otherwise read "INVALID_CREDENTIALS" or "PATIENT_NOT_FOUND".
 */
const FRIENDLY_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: "The email or password is incorrect.",
  UNAUTHENTICATED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You do not have permission to do that.",
  EMAIL_IN_USE: "That email address is already in use.",
  DOCTOR_NOT_FOUND: "That doctor could not be found.",
  PATIENT_NOT_FOUND: "That patient could not be found.",
  VALIDATION_ERROR: "Please check the details and try again.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  INTERNAL: "Something went wrong on the server. Please try again.",
};

/**
 * Picks the most useful message for a failed request: a server-authored
 * message when there is one, a friendly default for known error codes, and
 * the caller's fallback otherwise.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const message = error.message.trim();
    if (message.length > 0 && message !== error.code) return message;
    return FRIENDLY_BY_CODE[error.code] ?? fallback;
  }
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  return fallback;
}
