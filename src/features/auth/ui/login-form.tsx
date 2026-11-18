"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { authApi } from "@/features/auth/api/auth-api";
import { loginSchema, type LoginValues } from "@/features/auth/model/login-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/types";
import { notifyError, notifySuccess } from "@/lib/toast";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      await authApi.login(values);
      notifySuccess("Signed in", "Welcome back to Doctor Tracker.");
      router.push("/dashboard");
    } catch (error) {
      notifyError("Sign in failed", error, "The sign-in request could not be completed.");
      if (!(error instanceof ApiError)) return;
      const fieldDetails = error.details.filter(
        (detail) => detail.path === "email" || detail.path === "password",
      );
      for (const detail of fieldDetails) {
        form.setError(detail.path as "email" | "password", { message: detail.message });
      }
    }
  }

  return (
    <form
      className="mx-auto flex w-full max-w-90 flex-col gap-5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="mb-2 flex flex-col items-center text-center">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-[#fb7185] to-[#e11d48] text-white shadow-[0_10px_22px_-14px_rgba(225,29,72,0.85)]"
          >
            <DirectoryMark />
          </span>
          <p className="text-[20px] leading-none font-bold tracking-[-0.02em]">Doctor Tracker</p>
        </div>
        <h2 className="mt-8 text-[26px] leading-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-ink-secondary">Sign in to the directory.</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          aria-describedby={form.formState.errors.email ? "email-error" : undefined}
          aria-invalid={form.formState.errors.email ? true : undefined}
          autoComplete="email"
          id="email"
          placeholder="admin@clinic.com"
          type="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-danger-text" id="email-error">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            aria-describedby={form.formState.errors.password ? "password-error" : undefined}
            aria-invalid={form.formState.errors.password ? true : undefined}
            autoComplete="current-password"
            className="pr-12"
            id="password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            {...form.register("password")}
          />
          <Button
            aria-pressed={showPassword}
            className="absolute top-1 right-1 size-8 px-0"
            onClick={() => setShowPassword((current) => !current)}
            size="compact"
            type="button"
            variant="quiet"
          >
            <span className="sr-only">{showPassword ? "Hide" : "Show"}</span>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
        {form.formState.errors.password ? (
          <p className="text-xs text-danger-text" id="password-error">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <Button className="mt-1 w-full" disabled={form.formState.isSubmitting} type="submit">
        Sign in
      </Button>
    </form>
  );
}

function DirectoryMark() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M3 12h3.2l1.8-4.5 3 9L14 8l1.9 4H21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M1.75 8S4.1 4.25 8 4.25 14.25 8 14.25 8 11.9 11.75 8 11.75 1.75 8 1.75 8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M2.5 2.5 13.5 13.5M6.6 6.7A1.7 1.7 0 0 0 9.3 9.4M4.2 4.6C2.9 5.5 1.75 8 1.75 8S4.1 11.75 8 11.75c1.05 0 2-.28 2.82-.7M7.1 4.32A6 6 0 0 1 8 4.25C11.9 4.25 14.25 8 14.25 8c-.28.46-.62.95-1.02 1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}
