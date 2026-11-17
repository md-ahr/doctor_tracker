"use client";

import Link from "next/link";

import { useSession } from "@/features/auth/hooks/use-session";

export function PortalTopbar() {
  const session = useSession();
  const name = session.data?.name ?? "Admin";
  const initial = name.trim().slice(0, 1).toUpperCase() || "A";

  return (
    <header className="portal-top">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full bg-[#d9c8ff] text-sm font-semibold text-[#4b2f86]"
        >
          {initial}
        </span>
        <p className="text-[15px] font-semibold">{name}</p>
      </div>

      <form
        className="portal-search"
        onSubmit={(event) => {
          event.preventDefault();
        }}
        role="search"
      >
        <SearchIcon />
        <label className="sr-only" htmlFor="portal-search">
          Search
        </label>
        <input id="portal-search" name="q" placeholder="Search" type="search" />
      </form>

      <Link
        className="inline-flex h-11 items-center justify-center justify-self-end rounded-full bg-(--portal-violet) px-5 text-sm font-semibold text-white hover:bg-(--portal-violet-deep)"
        href="/patients"
      >
        + New patient
      </Link>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="var(--portal-muted)"
      strokeLinecap="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="16"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" />
    </svg>
  );
}
