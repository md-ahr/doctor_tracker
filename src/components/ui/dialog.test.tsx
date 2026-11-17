import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

test("opens from the trigger", async () => {
  const user = userEvent.setup();

  render(
    <Dialog>
      <DialogTrigger>Add doctor</DialogTrigger>
      <DialogContent>
        <DialogTitle>Add doctor</DialogTitle>
        <DialogDescription>Create a directory entry.</DialogDescription>
      </DialogContent>
    </Dialog>,
  );

  expect(screen.queryByRole("dialog")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Add doctor" }));

  expect(screen.getByRole("dialog", { name: "Add doctor" })).toBeDefined();
});
