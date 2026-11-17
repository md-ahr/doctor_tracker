import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { PortalNav } from "@/features/auth/ui/portal-nav";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/access-token";

const push = vi.fn();
const logout = vi.fn(async () => undefined);

vi.mock("next/navigation", () => ({
  usePathname: () => "/doctors",
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
});

test("shows the admin name and the portal links", () => {
  render(<PortalNav />);

  expect(screen.getByRole("navigation", { name: "Portal" })).toBeDefined();
  expect(screen.getByText("Avery Admin")).toBeDefined();
  expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/dashboard");
  expect(screen.getByRole("link", { name: "Doctors" }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("link", { name: "Patients" }).getAttribute("href")).toBe("/patients");
});

test("logout calls the API and does not leave a token in memory", async () => {
  setAccessToken("jwt-1");
  const user = userEvent.setup();
  render(<PortalNav />);

  await user.click(screen.getByRole("button", { name: "Log out" }));

  expect(logout).toHaveBeenCalled();
  expect(getAccessToken()).toBeNull();
  expect(push).toHaveBeenCalledWith("/login");
});
