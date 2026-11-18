import type { ReactNode } from "react";

import { PortalSessionGate } from "@/features/auth/ui/portal-session-gate";
import { PortalShell } from "@/features/auth/ui/portal-shell";

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <PortalSessionGate>
      <PortalShell>{children}</PortalShell>
    </PortalSessionGate>
  );
}
