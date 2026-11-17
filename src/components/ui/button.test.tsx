import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Button } from "@/components/ui/button";

test("renders its children", () => {
  render(<Button>Add doctor</Button>);

  expect(screen.getByRole("button", { name: "Add doctor" }).textContent).toBe("Add doctor");
});

test("primary variant has an accessible name", () => {
  render(<Button variant="primary">Sign in</Button>);

  expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
});
