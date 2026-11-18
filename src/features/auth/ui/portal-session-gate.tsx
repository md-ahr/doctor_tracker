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
      <div aria-busy="true" aria-live="polite" className="portal-boot">
        <div className="portal-boot-inner">
          <span aria-hidden="true" className="portal-boot-mark">
            <PulseIcon />
          </span>
          <p className="portal-boot-text">Checking your session</p>
        </div>
      </div>
    );
  }

  return children;
}

function PulseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
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
