"use client";

import { useEffect, useState, type ReactNode } from "react";

import { PortalNav } from "@/features/auth/ui/portal-nav";
import { PortalTopbar } from "@/features/auth/ui/portal-topbar";

type PortalShellProps = {
  children: ReactNode;
};

const desktopQuery = "(min-width: 1024px)";

export function PortalShell({ children }: PortalShellProps) {
  const [railOpen, setRailOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  function onMenuClick() {
    if (window.matchMedia(desktopQuery).matches) {
      setRailOpen((current) => !current);
      return;
    }
    setDrawerOpen((current) => !current);
  }

  return (
    <div
      className="portal-frame"
      data-drawer={drawerOpen ? "open" : "closed"}
      data-rail={railOpen ? "open" : "closed"}
    >
      <PortalNav collapsed={!railOpen} onNavigate={() => setDrawerOpen(false)} />
      <button
        aria-hidden={!drawerOpen}
        aria-label="Close navigation"
        className="portal-scrim"
        onClick={() => setDrawerOpen(false)}
        tabIndex={drawerOpen ? 0 : -1}
        type="button"
      />
      <div className="portal-stage">
        <PortalTopbar onMenuClick={onMenuClick} />
        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}
