import { FIRST_PAGE } from "@/lib/paging";

type SafeParser<T> = {
  safeParse: (value: unknown) => { success: true; data: T } | { success: false };
};

/**
 * Reads one filter field from a URL param. A value the matching Zod schema
 * rejects falls back to the default instead of failing the whole query.
 */
export function readField<T>(parser: SafeParser<T>, value: string | null, fallback: T): T {
  const result = parser.safeParse(value ?? fallback);
  return result.success ? result.data : fallback;
}

/** Reads a one-based page number. Anything malformed lands on page 1. */
export function readPage(value: string | null): number {
  if (value === null) return FIRST_PAGE;
  const page = Number(value);
  if (!Number.isInteger(page) || page < FIRST_PAGE) return FIRST_PAGE;
  return page;
}

/** Reads a page size the screen offers. Anything else lands on the default. */
export function readPageSize<T extends number>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  if (value === null) return fallback;
  const limit = Number(value);
  return allowed.find((size) => size === limit) ?? fallback;
}
