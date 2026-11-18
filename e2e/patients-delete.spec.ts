import { expect, test } from "@playwright/test";

import { rejectLogin, signIn } from "./api";

test("shows the invalid login message", async ({ page }) => {
  await rejectLogin(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("wrong password");
  await page.getByRole("button", { name: "Sign in" }).click();

  const errorToast = page.locator("[data-sonner-toast]");
  await expect(errorToast).toContainText("Sign in failed");
  await expect(errorToast).toContainText("Invalid email or password");
  await expect(page).toHaveURL(/\/login$/);
});

test("names the patient in the delete confirmation", async ({ page }) => {
  await signIn(page);
  await page.goto("/patients");

  await page.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByRole("heading", { name: "Delete Amina Rahman?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete patient" })).toBeVisible();
});
