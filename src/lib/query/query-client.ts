import { QueryClient } from "@tanstack/react-query";

import { isMissingRecordError } from "@/lib/api/errors";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A definitive 404 or a rejected id will answer the same way again, so
        // only transient failures get the single retry.
        retry: (failureCount, error) => !isMissingRecordError(error) && failureCount < 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
