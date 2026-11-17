import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { DoctorFormDialog } from "@/features/doctors/ui/doctor-form";
import { ApiError } from "@/lib/api/types";

const mutateAsync = vi.fn();

vi.mock("@/features/doctors/hooks/use-doctor-mutations", () => ({
  useCreateDoctor: () => ({ mutateAsync, isPending: false }),
  useUpdateDoctor: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

afterEach(() => {
  cleanup();
  mutateAsync.mockReset();
});

async function fillDoctor(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add doctor" }));
  await user.type(screen.getByRole("textbox", { name: /Name/ }), "Amelia Rahman");
  await user.type(screen.getByRole("textbox", { name: /Specialization/ }), "Cardiology");
  await user.type(screen.getByRole("textbox", { name: /Hospital/ }), "City General");
  await user.type(screen.getByRole("textbox", { name: /Phone/ }), "+1 202 555 0148");
  await user.type(screen.getByRole("textbox", { name: /Email/ }), "amelia@citygeneral.example");
}

test("maps an API field error onto the email field", async () => {
  mutateAsync.mockRejectedValue(
    new ApiError(409, "CONFLICT", "Email already exists", [
      { path: "email", message: "Email already exists" },
    ]),
  );
  const user = userEvent.setup();
  render(<DoctorFormDialog />);

  await fillDoctor(user);
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(await screen.findByText("Email already exists")).toBeDefined();
});

test("shows a form-level message when the API error has no field path", async () => {
  mutateAsync.mockRejectedValue(new ApiError(409, "CONFLICT", "Email already exists"));
  const user = userEvent.setup();
  render(<DoctorFormDialog />);

  await fillDoctor(user);
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Email already exists");
});
