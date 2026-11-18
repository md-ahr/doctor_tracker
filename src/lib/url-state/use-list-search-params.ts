"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

/** A key that is left out of the URL is `undefined` or empty. */
export type ListParamPatch = Record<string, string | number | undefined>;

/** Filters replace the entry; a page step can push so Back returns to the last page. */
export type HistoryMode = "push" | "replace";

/**
 * The URL is the source of truth for list filters, paging, and page size.
 * Reading uses `useSearchParams`, writing patches only the keys it is given so
 * unrelated params survive, and defaults are dropped to keep the URL canonical.
 */
export function useListSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const navigate = useCallback(
    (patch: ListParamPatch, mode: HistoryMode = "replace") => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }

      const query = next.toString();
      const href = query.length === 0 ? pathname : `${pathname}?${query}`;

      startTransition(() => {
        if (mode === "push") router.push(href, { scroll: false });
        else router.replace(href, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  return { searchParams, navigate };
}
