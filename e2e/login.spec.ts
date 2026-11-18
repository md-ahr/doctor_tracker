import { expect, test } from "@playwright/test";

import { signIn } from "./api";

test("sends an anonymous visit to the login page, then into the portal", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await signIn(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("sends an anonymous root visit to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("sends a signed-in root visit to the dashboard", async ({ page }) => {
  await signIn(page);

  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
});
