"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/doctors", label: "Doctors", icon: "doctors" },
  { href: "/patients", label: "Patients", icon: "patients" },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type PortalNavProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function PortalNav({ collapsed = false, onNavigate }: PortalNavProps = {}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Portal" className="portal-nav" data-collapsed={collapsed ? "true" : "false"}>
      <div className="portal-brand">
        <span aria-hidden="true" className="portal-brand-mark">
          <PulseIcon />
        </span>
        <div className="portal-brand-copy">
          <p className="portal-wordmark">Doctor Tracker</p>
          <p className="portal-wordmark-role">Admin workspace</p>
        </div>
      </div>

      <div className="portal-nav-section pt-6">
        <p className="portal-nav-caption">Menu</p>
        <ul className="portal-nav-links">
          {links.map((link) => {
            const current = isCurrent(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  aria-current={current ? "page" : undefined}
                  href={link.href}
                  onClick={onNavigate}
                  title={collapsed ? link.label : undefined}
                >
                  <span aria-hidden="true" className="portal-nav-icon">
                    <NavIcon name={link.icon} />
                  </span>
                  <span className="portal-nav-label">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="portal-promo">
        <PromoArt />
        <p className="portal-promo-title">Keep every record current</p>
        <p className="portal-promo-copy">Update a patient or open a doctor to review their list.</p>
        <Link className="portal-promo-link" href="/patients" onClick={onNavigate}>
          Open patient registry
          <ArrowRightIcon />
        </Link>
      </div>
    </nav>
  );
}

function PulseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
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

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
      <path
        d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PromoArt() {
  return (
    <svg aria-hidden="true" className="portal-promo-art" fill="none" viewBox="0 0 196 92">
      <rect fill="#ffffff" height="64" rx="14" width="92" x="10" y="16" />
      <rect fill="#ccfbf1" height="18" rx="9" width="92" x="10" y="16" />
      <rect fill="#0d9488" height="22" rx="4" width="4" x="30" y="8" />
      <rect fill="#0d9488" height="22" rx="4" width="4" x="78" y="8" />
      <rect fill="#eef2ff" height="8" rx="4" width="26" x="24" y="44" />
      <rect fill="#eef2ff" height="8" rx="4" width="34" x="24" y="58" />
      <rect fill="#eef2ff" height="8" rx="4" width="20" x="64" y="44" />
      <circle cx="152" cy="52" fill="#4f46e5" r="26" />
      <path d="M152 41v22M141 52h22" stroke="#ffffff" strokeLinecap="round" strokeWidth="4" />
      <circle cx="168" cy="26" fill="#f43f5e" r="7" />
      <circle cx="34" cy="84" fill="#fbcfe8" r="3" />
    </svg>
  );
}

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  if (name === "dashboard") {
    return (
      <svg
        fill="none"
        height="20"
        stroke="currentColor"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
        width="20"
      >
        <rect height="7" rx="2" width="7" x="3" y="3" />
        <rect height="7" rx="2" width="7" x="14" y="3" />
        <rect height="7" rx="2" width="7" x="3" y="14" />
        <rect height="7" rx="2" width="7" x="14" y="14" />
      </svg>
    );
  }

  if (name === "doctors") {
    return (
      <svg
        fill="none"
        height="20"
        stroke="currentColor"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
        width="20"
      >
        <rect height="16" rx="3" width="17" x="3.5" y="4" />
        <path d="M8 4V2.8M16 4V2.8M3.5 9h17" />
        <path d="M12 12.5v5M9.5 15h5" />
      </svg>
    );
  }

  return (
    <svg
      fill="none"
      height="20"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width="20"
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.5-3.6 2.6-5.4 5.5-5.4s5 1.8 5.5 5.4" />
      <path d="M16 5.4a3 3 0 0 1 0 5.6M17.5 14.8c1.9.6 3 2.4 3.3 5.2" />
    </svg>
  );
}
