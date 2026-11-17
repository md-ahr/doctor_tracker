import { expect, test } from "vitest";

import { createQueryClient } from "@/lib/query/query-client";

test("uses the shared query defaults", () => {
  const client = createQueryClient();

  expect(client.getDefaultOptions().queries).toMatchObject({
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
});
