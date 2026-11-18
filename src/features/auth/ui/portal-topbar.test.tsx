import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { PortalTopbar } from "@/features/auth/ui/portal-topbar";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/access-token";

const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));

const push = vi.fn();
const logout = vi.fn(async () => undefined);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/auth/hooks/use-session", () => ({
  useSession: () => ({ data: { name: "Avery Admin", email: "admin@example.com" } }),
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  authApi: {
    logout: () => logout(),
  },
}));

afterEach(() => {
  cleanup();
  clearAccessToken();
  toastSuccess.mockReset();
  toastError.mockReset();
});

test("shows the signed-in admin and forwards the menu action", async () => {
  const onMenuClick = vi.fn();
  const user = userEvent.setup();
  render(<PortalTopbar onMenuClick={onMenuClick} />);

  expect(screen.getByText("Avery Admin")).toBeDefined();
  expect(screen.getByText("Administrator")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Toggle navigation" }));
  expect(onMenuClick).toHaveBeenCalledOnce();
});

test("the account menu opens from the profile trigger and closes on Escape", async () => {
  const user = userEvent.setup();
  render(<PortalTopbar onMenuClick={() => undefined} />);

  const trigger = screen.getByRole("button", { name: /Avery Admin/ });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("button", { name: "Log out" })).toBeNull();

  await user.click(trigger);

  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("admin@example.com")).toBeDefined();

  await user.keyboard("{Escape}");

  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

test("logout calls the API and does not leave a token in memory", async () => {
  setAccessToken("jwt-1");
  const user = userEvent.setup();
  render(<PortalTopbar onMenuClick={() => undefined} />);

  await user.click(screen.getByRole("button", { name: /Avery Admin/ }));
  await user.click(screen.getByRole("button", { name: "Log out" }));

  expect(logout).toHaveBeenCalled();
  expect(getAccessToken()).toBeNull();
  expect(push).toHaveBeenCalledWith("/login");
  expect(toastSuccess).toHaveBeenCalledWith("Signed out", {
    description: "You have been logged out.",
  });
});
