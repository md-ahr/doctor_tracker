import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

test("page ground token is the cool canvas", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

  expect(css).toContain("--paper-0: #f4f7fc");
  expect(css).toContain("--bg-page: var(--paper-0)");
});
