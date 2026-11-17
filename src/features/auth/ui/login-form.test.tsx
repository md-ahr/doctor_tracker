import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";

import { LoginForm } from "@/features/auth/ui/login-form";
import { ApiError } from "@/lib/api/types";

const push = vi.fn();
const login = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  authApi: {
    login: (...args: unknown[]) => login(...args),
  },
}));

beforeEach(() => {
  cleanup();
  push.mockReset();
  login.mockReset();
});

test("shows the API error message when login fails", async () => {
  login.mockRejectedValue(new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password"));
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText("Email"), "admin@example.com");
  await user.type(screen.getByLabelText("Password"), "correct horse");
  await user.click(screen.getByRole("button", { name: "Sign in" }));

  expect((await screen.findByRole("status")).textContent).toBe("Invalid email or password");
  expect(push).not.toHaveBeenCalled();
});

test("opens the dashboard after a successful login", async () => {
  login.mockResolvedValue({ accessToken: "jwt-1" });
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText("Email"), "admin@example.com");
  await user.type(screen.getByLabelText("Password"), "correct horse");
  await user.click(screen.getByRole("button", { name: "Sign in" }));

  expect(push).toHaveBeenCalledWith("/dashboard");
});

test("does not call useQuery for login", () => {
  const source = readFileSync(join(process.cwd(), "src/features/auth/ui/login-form.tsx"), "utf8");

  expect(source).not.toContain("useQuery");
});
