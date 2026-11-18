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

test("gives the collapsed rail width to the content, not the gutters", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto("/patients");
  await expect(page.getByRole("heading", { name: "Patients", level: 1 })).toBeVisible();

  const readLayout = () =>
    page.evaluate(() => {
      const main = document.querySelector(".portal-main") as HTMLElement;
      const top = document.querySelector(".portal-top-inner") as HTMLElement;
      const stage = document.querySelector(".portal-stage") as HTMLElement;
      const style = getComputedStyle(main);
      const mainRect = main.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return {
        content: Math.round(mainRect.width - padding),
        leftGap: Math.round(mainRect.left - stageRect.left),
        rightGap: Math.round(stageRect.right - mainRect.right),
        topAligned: Math.round(top.getBoundingClientRect().left) === Math.round(mainRect.left),
      };
    });

  const expanded = await readLayout();
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  // The rail loses 178px, so the content gains exactly that much (after the transition).
  await expect.poll(async () => (await readLayout()).content).toBe(expanded.content + 178);
  const collapsed = await readLayout();

  // Side gutters stay put in both states instead of absorbing the freed width.
  expect(expanded.leftGap).toBe(expanded.rightGap);
  expect(collapsed.leftGap).toBe(collapsed.rightGap);
  expect(collapsed.leftGap).toBe(expanded.leftGap);
  // The top bar keeps tracking the content column.
  expect(expanded.topAligned).toBe(true);
  expect(collapsed.topAligned).toBe(true);
});
