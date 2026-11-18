"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/features/auth/api/auth-api";
import { useSession } from "@/features/auth/hooks/use-session";
import { clearAccessToken } from "@/lib/auth/access-token";
import { notifyError, notifySuccess } from "@/lib/toast";

type PortalTopbarProps = {
  onMenuClick: () => void;
};

export function PortalTopbar({ onMenuClick }: PortalTopbarProps) {
  const router = useRouter();
  const session = useSession();
  const name = session.data?.name ?? "Admin";
  const email = session.data?.email ?? null;
  const initial = name.trim().slice(0, 1).toUpperCase() || "A";
  const [fullscreen, setFullscreen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  async function onLogout() {
    setAccountOpen(false);
    try {
      await authApi.logout();
      notifySuccess("Signed out", "You have been logged out.");
    } catch (error) {
      notifyError("Could not sign out", error, "The session could not be closed on the server.");
    } finally {
      clearAccessToken();
      router.push("/login");
    }
  }

  async function onFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await document.documentElement.requestFullscreen();
    } catch {
      setFullscreen(false);
    }
  }

  return (
    <header className="portal-top">
      <div className="portal-top-inner">
        <button
          aria-label="Toggle navigation"
          className="portal-menu-button"
          onClick={onMenuClick}
          type="button"
        >
          <MenuIcon />
        </button>

        <div className="portal-top-actions">
          <button
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="portal-icon-button"
            data-desktop-only="true"
            onClick={() => void onFullscreen()}
            type="button"
          >
            {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
          </button>

          <div className="portal-account" ref={accountRef}>
            <button
              aria-expanded={accountOpen}
              className="portal-account-trigger"
              onClick={() => setAccountOpen((current) => !current)}
              type="button"
            >
              <span aria-hidden="true" className="portal-avatar">
                {initial}
              </span>
              <span className="portal-user-copy">
                <span className="portal-user-name">{name}</span>
                <span className="portal-user-role">Administrator</span>
              </span>
              <span aria-hidden="true" className="portal-account-chevron">
                <ChevronDownIcon />
              </span>
            </button>

            {accountOpen ? (
              <div aria-label="Account" className="portal-account-menu" role="group">
                <p className="portal-account-name">{name}</p>
                {email ? <p className="portal-account-email">{email}</p> : null}
                <button
                  className="portal-account-action"
                  onClick={() => void onLogout()}
                  type="button"
                >
                  <span aria-hidden="true" className="portal-account-action-icon">
                    <LogOutIcon />
                  </span>
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17">
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17">
      <path
        d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17">
      <path
        d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 8l-4 4 4 4M6 12h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
