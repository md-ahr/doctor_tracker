import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import ErrorPage from "@/app/error";
import NotFound from "@/app/not-found";

const navigation = vi.hoisted(() => ({ back: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: navigation.back }),
}));

afterEach(() => {
  cleanup();
  navigation.back.mockReset();
  vi.restoreAllMocks();
});

test("the 404 page keeps the directory within reach", async () => {
  const user = userEvent.setup();

  render(<NotFound />);

  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "This page isn't in the directory",
  );
  expect(screen.getByText("Error 404")).toBeDefined();
  expect(screen.getByRole("link", { name: "Back to dashboard" }).getAttribute("href")).toBe(
    "/dashboard",
  );
  expect(screen.getByRole("link", { name: "Doctors" }).getAttribute("href")).toBe("/doctors");

  await user.click(screen.getByRole("button", { name: "Go back" }));
  expect(navigation.back).toHaveBeenCalledOnce();
});

test("the error page explains the failure, shows its reference, and retries", async () => {
  const user = userEvent.setup();
  const reset = vi.fn();
  const error = Object.assign(new Error("boom"), { digest: "1a2b3c" });

  render(<ErrorPage error={error} reset={reset} />);

  expect(screen.getByText("Something went wrong")).toBeDefined();
  expect(screen.getByText("1a2b3c")).toBeDefined();
  expect(screen.getByRole("link", { name: "Back to dashboard" }).getAttribute("href")).toBe(
    "/dashboard",
  );

  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(reset).toHaveBeenCalledOnce();
});
