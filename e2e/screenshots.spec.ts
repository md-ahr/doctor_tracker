import { expect, test } from "@playwright/test";

import { signIn } from "./api";

const shots = [
  { path: "/dashboard", name: "dashboard", heading: "Dashboard" },
  { path: "/doctors", name: "doctors", heading: "Doctors" },
  { path: "/patients", name: "patients", heading: "Patients" },
] as const;

test("captures desktop and mobile views of the directory", async ({ page }) => {
  await signIn(page);

  for (const shot of shots) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(shot.path);
    await expect(page.getByRole("heading", { name: shot.heading, level: 1 })).toBeVisible();
    await page.screenshot({
      path: `docs/screenshots/${shot.name}-desktop.png`,
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(shot.path);
    await expect(page.getByRole("heading", { name: shot.heading, level: 1 })).toBeVisible();
    await page.screenshot({
      path: `docs/screenshots/${shot.name}-mobile.png`,
      fullPage: true,
    });
  }
});
