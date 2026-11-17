import { useQueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Providers } from "@/app/providers";

function Probe() {
  useQueryClient();
  return <span>query client ready</span>;
}

test("provides a query client to children", () => {
  render(
    <Providers>
      <Probe />
    </Providers>,
  );

  expect(screen.getByText("query client ready")).toBeDefined();
});
