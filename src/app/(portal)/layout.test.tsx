import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { Providers } from "@/app/providers";
import { clearAccessToken, setAccessToken } from "@/lib/auth/access-token";

import PortalLayout from "./layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  authApi: {
    logout: async () => undefined,
    me: async () => ({ name: "Avery Admin", email: "admin@example.com" }),
    refresh: async () => undefined,
  },
}));

afterEach(() => {
  cleanup();
  clearAccessToken();
});

test("portal layout shows the nav links around the page", () => {
  setAccessToken("jwt-1");

  render(
    <Providers>
      <PortalLayout>
        <p>Directory</p>
      </PortalLayout>
    </Providers>,
  );

  expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/dashboard");
  expect(screen.getByRole("link", { name: "Doctors" }).getAttribute("href")).toBe("/doctors");
  expect(screen.getByRole("link", { name: "Patients" }).getAttribute("href")).toBe("/patients");
  expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByText("Directory")).toBeDefined();
});
