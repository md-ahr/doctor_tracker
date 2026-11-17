import { afterEach, expect, test, vi } from "vitest";

import { apiRequest } from "@/lib/api/http-client";
import { ApiError } from "@/lib/api/types";
import { clearAccessToken } from "@/lib/auth/access-token";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  clearAccessToken();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("returns typed data from a success envelope", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  const fetchMock = vi.fn().mockResolvedValue(
    jsonResponse({
      success: true,
      message: "Doctors loaded",
      data: { id: "doc-1", name: "Ada" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  const body = await apiRequest<{ id: string; name: string }>("/api/v1/doctors");

  expect(body.data).toEqual({ id: "doc-1", name: "Ada" });
  expect(fetchMock).toHaveBeenCalledWith(
    "http://api.test/api/v1/doctors",
    expect.objectContaining({ credentials: "include" }),
  );
});

test("throws ApiError with details when the envelope reports failure", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      jsonResponse(
        {
          success: false,
          message: "Check the form",
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            details: [{ path: "email", message: "Invalid email" }],
          },
        },
        422,
      ),
    ),
  );

  const error = await apiRequest("/api/v1/doctors").catch((caught: unknown) => caught);

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({
    status: 422,
    code: "VALIDATION_ERROR",
    details: [{ path: "email", message: "Invalid email" }],
  });
});
