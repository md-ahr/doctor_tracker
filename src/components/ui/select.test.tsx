import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

test("renders the compact filter select", () => {
  render(
    <Select>
      <SelectTrigger aria-label="Condition" size="compact">
        <SelectValue placeholder="Condition" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="stable">Stable</SelectItem>
      </SelectContent>
    </Select>,
  );

  expect(screen.getByRole("combobox", { name: "Condition" })).toBeDefined();
});
