import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { useSession } from "@/features/auth/hooks/use-session";
import { clearAccessToken, setAccessToken } from "@/lib/auth/access-token";
import { createQueryClient } from "@/lib/query/query-client";

const api = "http://api.test";
const server = setupServer();

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", api);
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
  clearAccessToken();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

function renderSession() {
  const client = createQueryClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, ...renderHook(() => useSession(), { wrapper: Wrapper }) };
}

test("does not request the profile when there is no access token", async () => {
  let calls = 0;
  server.use(
    http.get(`${api}/api/v1/auth/me`, () => {
      calls += 1;
      return HttpResponse.json({
        success: true,
        message: "Admin profile retrieved successfully",
        data: { id: "admin-1", name: "Avery Admin", email: "admin@example.com" },
      });
    }),
  );

  const { result } = renderSession();
  await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));

  expect(calls).toBe(0);
  expect(result.current.data).toBeUndefined();
});

test("returns the admin name and email", async () => {
  setAccessToken("jwt-1");
  server.use(
    http.get(`${api}/api/v1/auth/me`, () =>
      HttpResponse.json({
        success: true,
        message: "Admin profile retrieved successfully",
        data: { id: "admin-1", name: "Avery Admin", email: "admin@example.com" },
      }),
    ),
  );

  const { client, result } = renderSession();

  await waitFor(() => expect(result.current.data?.name).toBe("Avery Admin"));
  expect(result.current.data?.email).toBe("admin@example.com");
  expect(client.getQueryCache().find({ queryKey: ["auth", "me"] })).toBeDefined();
});
