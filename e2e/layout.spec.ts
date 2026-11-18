import { expect, test } from "@playwright/test";

import { signIn } from "./api";

const pages = [
  { path: "/dashboard", heading: "Dashboard" },
  { path: "/doctors", heading: "Doctors" },
  { path: "/patients", heading: "Patients" },
] as const;

const widths = [1280, 1024, 720, 390] as const;

test("keeps every portal page inside the viewport", async ({ page }) => {
  await signIn(page);

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });

    for (const entry of pages) {
      await page.goto(entry.path);
      await expect(page.getByRole("heading", { name: entry.heading, level: 1 })).toBeVisible();
      await expect(page.getByText(/^Loading/)).toHaveCount(0);

      const viewport = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(
        viewport.scrollWidth,
        `${entry.path} overflows at ${width}px (${viewport.scrollWidth} > ${viewport.clientWidth})`,
      ).toBeLessThanOrEqual(viewport.clientWidth + 1);
    }
  }
});
