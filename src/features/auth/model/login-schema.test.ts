import { expect, test } from "vitest";

import { loginSchema } from "@/features/auth/model/login-schema";

test("trims and lowercases a valid email and accepts a password of 8 characters", () => {
  const parsed = loginSchema.safeParse({
    email: "  Admin@Example.com  ",
    password: "correct1",
  });

  expect(parsed.success).toBe(true);
  if (parsed.success) {
    expect(parsed.data).toEqual({ email: "admin@example.com", password: "correct1" });
  }
});

test("rejects an invalid email, an email over 254 characters, and a short password", () => {
  expect(loginSchema.safeParse({ email: "not-an-email", password: "correct1" }).success).toBe(
    false,
  );
  expect(
    loginSchema.safeParse({
      email: `${"a".repeat(250)}@example.com`,
      password: "correct1",
    }).success,
  ).toBe(false);
  const shortPassword = loginSchema.safeParse({ email: "admin@example.com", password: "short" });
  expect(shortPassword.success).toBe(false);
  if (!shortPassword.success) {
    expect(
      shortPassword.error.issues.some((issue) => issue.message === "Use at least 8 characters"),
    ).toBe(true);
  }
});
