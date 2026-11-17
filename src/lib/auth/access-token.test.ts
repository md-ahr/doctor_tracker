import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, expect, test, vi } from "vitest";

import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/access-token";

afterEach(() => {
  clearAccessToken();
  vi.unstubAllGlobals();
});

test("sets, reads, and clears the in-memory access token", () => {
  expect(getAccessToken()).toBeNull();

  setAccessToken("token-a");
  expect(getAccessToken()).toBe("token-a");

  clearAccessToken();
  expect(getAccessToken()).toBeNull();
});

test("does not write the access token to web storage", () => {
  const setItem = vi.fn();
  vi.stubGlobal("localStorage", { setItem, getItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("sessionStorage", { setItem, getItem: vi.fn(), removeItem: vi.fn() });

  setAccessToken("token-a");
  clearAccessToken();

  expect(setItem).not.toHaveBeenCalled();

  const source = readFileSync(join(process.cwd(), "src/lib/auth/access-token.ts"), "utf8");
  expect(source).not.toContain("localStorage");
  expect(source).not.toContain("sessionStorage");
});
