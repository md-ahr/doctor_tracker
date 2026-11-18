"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** Fast responses stay blank so the content region does not flicker. */
export const DATA_LOADING_DELAY_MS = 150;

const fallbackMessage = "The directory could not be loaded.";

export function directoryErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.message.trim().length > 0) {
    return error.message;
  }
  return fallbackMessage;
}

type DataLoadingProps = {
  label: string;
  className?: string;
};

export function DataLoading({ label, className }: DataLoadingProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), DATA_LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div aria-busy="true" className={cn("flex flex-col gap-3", className)}>
      <p className="sr-only">{label}</p>
      <span className="h-3 w-full rounded-xs bg-inset" data-loading-line="" />
      <span className="h-3 w-full rounded-xs bg-inset" data-loading-line="" />
      <span className="h-3 w-full rounded-xs bg-inset" data-loading-line="" />
    </div>
  );
}

type DataEmptyProps = {
  title: string;
  guidance: string;
  action?: ReactNode;
};

export function DataEmpty({ title, guidance, action }: DataEmptyProps) {
  return (
    <div className="px-4 pt-16 text-center">
      <p className="text-[15px] text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-[62ch] text-sm text-ink-secondary">{guidance}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

type DataErrorProps = {
  message: string;
  onRetry: () => void;
};

export function DataError({ message, onRetry }: DataErrorProps) {
  return (
    <div
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-danger-text/40 bg-danger-wash px-4 py-3 text-sm"
      role="status"
    >
      <p>{message}</p>
      <Button onClick={onRetry} type="button" variant="quiet">
        Try again
      </Button>
    </div>
  );
}
