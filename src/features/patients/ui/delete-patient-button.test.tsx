import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { DeletePatientButton } from "@/features/patients/ui/delete-patient-button";

const mutateAsync = vi.fn();

vi.mock("@/features/patients/hooks/use-patient-mutations", () => ({
  useDeletePatient: () => ({ mutateAsync, isPending: false }),
}));

afterEach(() => {
  cleanup();
  mutateAsync.mockReset();
});

test("names the patient before the destructive action", async () => {
  mutateAsync.mockResolvedValue(undefined);
  const user = userEvent.setup();

  render(
    <DeletePatientButton
      patient={{
        id: "pat-1",
        doctorId: "665f1c0a2b3c4d5e6f708193",
        fullName: "Noah Khan",
      }}
    />,
  );

  expect(screen.queryByText("Delete Noah Khan?")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Delete Noah Khan" }));

  expect(screen.getByText("Delete Noah Khan?")).toBeDefined();
  expect(mutateAsync).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Delete patient" }));
  expect(mutateAsync).toHaveBeenCalledWith({
    id: "pat-1",
    doctorId: "665f1c0a2b3c4d5e6f708193",
    fullName: "Noah Khan",
  });
});
