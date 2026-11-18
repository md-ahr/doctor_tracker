"use client";

import { useEffect, useRef } from "react";

type UseClampPageOptions = {
  page: number;
  totalPages: number;
  onOutOfRange: (page: number) => void;
};

/**
 * Keeps a paged URL honest. A shared or bookmarked `?page=` can outlive the
 * rows it pointed at, so the first response that reports fewer pages rewrites
 * the URL to the last page that still exists. The requested page is remembered
 * so a navigation that does not take effect cannot loop.
 */
export function useClampPage({ page, totalPages, onOutOfRange }: UseClampPageOptions) {
  const requested = useRef(0);

  useEffect(() => {
    if (totalPages < 1 || page <= totalPages) {
      requested.current = 0;
      return;
    }
    if (requested.current === page) return;

    requested.current = page;
    onOutOfRange(totalPages);
  }, [onOutOfRange, page, totalPages]);
}
