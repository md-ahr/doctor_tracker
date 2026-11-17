"use client";

import type { ReactNode } from "react";

import { useBootstrapSession } from "@/features/auth/hooks/use-bootstrap-session";

type PortalSessionGateProps = {
  children: ReactNode;
};

export function PortalSessionGate({ children }: PortalSessionGateProps) {
  const { ready } = useBootstrapSession();

  if (!ready) {
    return (
      <div aria-busy="true" aria-live="polite">
        <p className="text-sm text-ink-secondary">Checking your session</p>
      </div>
    );
  }

  return children;
}
