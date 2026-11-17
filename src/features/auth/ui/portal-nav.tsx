"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authApi } from "@/features/auth/api/auth-api";
import { useSession } from "@/features/auth/hooks/use-session";
import { Button } from "@/components/ui/button";
import { clearAccessToken } from "@/lib/auth/access-token";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "overview" },
  { href: "/doctors", label: "Doctors", icon: "doctors" },
  { href: "/patients", label: "Patients", icon: "patients" },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  const common = {
    "aria-hidden": true as const,
    fill: "none",
    height: 18,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
    width: 18,
  };

  if (name === "doctors") {
    return (
      <svg {...common}>
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
        <path d="M16 8v6M13 11h6" />
      </svg>
    );
  }

  if (name === "patients") {
    return (
      <svg {...common}>
        <rect height="14" rx="2" width="12" x="6" y="5" />
        <path d="M9 5V4a3 3 0 0 1 6 0v1M9 12h6M9 16h4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect height="7" rx="1.5" width="7" x="3.5" y="3.5" />
      <rect height="7" rx="1.5" width="7" x="13.5" y="3.5" />
      <rect height="7" rx="1.5" width="7" x="3.5" y="13.5" />
      <rect height="7" rx="1.5" width="7" x="13.5" y="13.5" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 place-items-center rounded-xl bg-(--portal-violet) text-lg leading-none font-semibold text-white"
    >
      +
    </span>
  );
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
      <div className="flex items-center gap-2.5 px-2">
        <BrandMark />
        <p className="font-serif text-[18px] leading-none font-medium tracking-tight whitespace-nowrap">
          Doctor Tracker
        </p>
      </div>

      <ul className="mt-10 flex flex-col gap-1">
        {links.map((link) => {
          const current = isCurrent(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                aria-current={current ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] ${
                  current
                    ? "bg-(--portal-violet-soft) font-semibold text-(--portal-violet)"
                    : "text-(--portal-muted)"
                }`}
                href={link.href}
              >
                <NavIcon name={link.icon} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex flex-col gap-2 px-2 pt-8">
        <p className="text-sm text-(--portal-ink)">{session.data?.name}</p>
        <p className="text-xs text-(--portal-muted) max-[479px]:hidden">{session.data?.email}</p>
        <Button
          className="self-start px-0 text-(--portal-rose) hover:bg-transparent hover:text-(--portal-rose)"
          onClick={onLogout}
          type="button"
          variant="quiet"
        >
          <LogoutIcon />
          Log out
        </Button>
      </div>
    </nav>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mr-2"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M9 6H6.5A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18H9" />
      <path d="M10 12h9M16 8l4 4-4 4" />
    </svg>
  );
}
