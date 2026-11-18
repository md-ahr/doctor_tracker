import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { PortalNav } from "@/features/auth/ui/portal-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/doctors",
}));

afterEach(() => {
  cleanup();
});

test("shows the portal links and marks the current route", () => {
  render(<PortalNav />);

  expect(screen.getByRole("navigation", { name: "Portal" })).toBeDefined();
  expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/dashboard");
  expect(screen.getByRole("link", { name: "Doctors" }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("link", { name: "Patients" }).getAttribute("href")).toBe("/patients");
});

test("collapsed rail keeps link labels accessible and adds hover titles", () => {
  render(<PortalNav collapsed />);

  const dashboard = screen.getByRole("link", { name: "Dashboard" });

  expect(screen.getByRole("navigation", { name: "Portal" }).getAttribute("data-collapsed")).toBe(
    "true",
  );
  expect(dashboard.getAttribute("title")).toBe("Dashboard");
  expect(screen.getByRole("link", { name: "Patients" }).getAttribute("title")).toBe("Patients");
});

test("expanded rail does not repeat labels as native tooltips", () => {
  render(<PortalNav />);

  expect(screen.getByRole("link", { name: "Dashboard" }).hasAttribute("title")).toBe(false);
});
