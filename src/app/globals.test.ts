import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

test("page ground token is warm paper", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

  expect(css).toContain("--paper-0: #f7f4ee");
  expect(css).toContain("--bg-page: var(--paper-0)");
});
