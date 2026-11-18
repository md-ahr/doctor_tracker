/** The API identifies every record with a Mongo ObjectId. */
const RECORD_ID_PATTERN = /^[a-f0-9]{24}$/i;

/**
 * True when a URL segment has the shape of a record id. Checking before a
 * request keeps a mistyped link out of the API, which would answer with a
 * generic "Request validation failed" instead of a missing record.
 */
export function isRecordId(value: string): boolean {
  return RECORD_ID_PATTERN.test(value);
}
