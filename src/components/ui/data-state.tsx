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
      <span className="h-3 w-full rounded-lg bg-inset" data-loading-line="" />
      <span className="h-3 w-full rounded-lg bg-inset" data-loading-line="" />
      <span className="h-3 w-full rounded-lg bg-inset" data-loading-line="" />
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
    <div className="data-empty">
      <span aria-hidden="true" className="data-empty-icon">
        <EmptyIcon />
      </span>
      <p className="data-empty-title">{title}</p>
      <p className="data-empty-guidance">{guidance}</p>
      {action ? <div className="mt-2">{action}</div> : null}
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
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger-text/25 bg-danger-wash px-4 py-3 text-[12.5px] text-danger-text"
      role="status"
    >
      <p className="flex items-center gap-2 font-medium">
        <span aria-hidden="true" className="grid size-6 place-items-center rounded-lg bg-white/70">
          <AlertIcon />
        </span>
        {message}
      </p>
      <Button onClick={onRetry} type="button" variant="quiet">
        Try again
      </Button>
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path d="M4 8.5 12 13l8-4.5M12 13v7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
      <path
        d="M12 8v5M12 17h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
