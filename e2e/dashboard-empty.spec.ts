import { expect, test } from "@playwright/test";

import { signIn } from "./api";

test("shows the empty copy when the range has no registrations", async ({ page }) => {
  await signIn(page, "empty");

  await expect(page.getByText("Nothing registered in this range")).toBeVisible();
  await expect(
    page.getByText("Totals above are unchanged. Widen the range to see earlier days."),
  ).toBeVisible();
});
