import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

test("associates the label with the input through htmlFor", () => {
  render(
    <>
      <Label htmlFor="email">Email</Label>
      <Input id="email" />
    </>,
  );

  expect(screen.getByLabelText("Email").id).toBe("email");
});
