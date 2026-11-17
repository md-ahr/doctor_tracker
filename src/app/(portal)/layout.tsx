import type { ReactNode } from "react";

import { PortalNav } from "@/features/auth/ui/portal-nav";
import { PortalSessionGate } from "@/features/auth/ui/portal-session-gate";
import { PortalTopbar } from "@/features/auth/ui/portal-topbar";

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <PortalSessionGate>
      <div className="portal-frame">
        <PortalNav />
        <div className="portal-stage">
          <PortalTopbar />
          <main>{children}</main>
        </div>
      </div>
    </PortalSessionGate>
  );
}
