import { expect, test } from "@playwright/test";

import { signIn } from "./api";

// Stable Safari, including every iOS browser, ships no Temporal global. Remove
// the engine's own implementation before any app script runs so the suite
// covers the polyfill path instead of Chromium's native one.
test("renders the dashboard where the browser ships no Temporal", async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.set(globalThis, "Temporal", undefined);
    Reflect.set(globalThis, "__temporalMissingBeforeApp", typeof Temporal === "undefined");
  });

  await signIn(page);

  expect(await page.evaluate(() => Reflect.get(globalThis, "__temporalMissingBeforeApp"))).toBe(
    true,
  );
  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  expect(await page.evaluate(() => typeof globalThis.Temporal)).toBe("object");
});
