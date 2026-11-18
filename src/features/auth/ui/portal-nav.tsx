"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authApi } from "@/features/auth/api/auth-api";
import { useSession } from "@/features/auth/hooks/use-session";
import { Button } from "@/components/ui/button";
import { clearAccessToken } from "@/lib/auth/access-token";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/doctors", label: "Doctors" },
  { href: "/patients", label: "Patients" },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  async function onLogout() {
    await authApi.logout();
    clearAccessToken();
    router.push("/login");
  }

  return (
    <nav aria-label="Portal" className="portal-nav">
      <div className="portal-brand">
        <p className="portal-wordmark">Doctor Tracker</p>
        <span aria-hidden="true" className="portal-brand-rule" />
      </div>

      <ul className="portal-nav-links">
        {links.map((link) => {
          const current = isCurrent(pathname, link.href);
          return (
            <li key={link.href}>
              <Link aria-current={current ? "page" : undefined} href={link.href}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="portal-account">
        <p className="portal-account-name">{session.data?.name}</p>
        <p className="portal-nav-email">{session.data?.email}</p>
        <Button onClick={onLogout} type="button" variant="quiet">
          Log out
        </Button>
      </div>
    </nav>
  );
}
