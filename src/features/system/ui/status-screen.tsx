import Link from "next/link";
import type { ReactNode } from "react";

export type StatusTone = "missing" | "failure";

export type StatusLayout = "page" | "embedded";

type StatusScreenProps = {
  /** `page` fills the viewport; `embedded` sits inside the portal chrome. */
  layout?: StatusLayout;
  tone: StatusTone;
  badge: string;
  title: string;
  description: string;
  actions: ReactNode;
  /** Optional support reference, e.g. an error digest. */
  reference?: ReactNode;
  quickLinks?: boolean;
};

const statusLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/doctors", label: "Doctors" },
  { href: "/patients", label: "Patients" },
] as const;

/**
 * Shared shell for the 404 and error boundaries so every dead end keeps the
 * portal's voice: rose brand mark, display type, and one clear way forward.
 */
export function StatusScreen({
  layout = "page",
  tone,
  badge,
  title,
  description,
  actions,
  reference,
  quickLinks = false,
}: StatusScreenProps) {
  const Container = layout === "page" ? "main" : "div";

  return (
    <Container
      aria-labelledby="status-title"
      className="status-screen"
      data-layout={layout}
      data-tone={tone}
    >
      <div className="status-column">
        {layout === "page" ? <StatusBrand /> : null}

        <section className="status-card">
          <StatusArtwork tone={tone} />

          <p className="status-badge" data-tone={tone}>
            {badge}
          </p>
          <h1 className="status-title" id="status-title">
            {title}
          </h1>
          <p className="status-description">{description}</p>

          {reference ? <p className="status-reference">{reference}</p> : null}

          <div className="status-actions">{actions}</div>

          {quickLinks ? <StatusQuickLinks /> : null}
        </section>

        {layout === "page" ? (
          <p className="status-footnote">Doctor Tracker · Admin workspace</p>
        ) : null}
      </div>
    </Container>
  );
}

function StatusBrand() {
  return (
    <div className="status-brand">
      <span aria-hidden="true" className="status-brand-mark">
        <PulseIcon />
      </span>
      <div>
        <p className="status-brand-name">Doctor Tracker</p>
        <p className="status-brand-role">Admin workspace</p>
      </div>
    </div>
  );
}

function StatusQuickLinks() {
  return (
    <div className="status-links">
      <p className="status-links-caption">Jump back in</p>
      <div className="status-links-row">
        {statusLinks.map((link) => (
          <Link className="status-link" href={link.href} key={link.href}>
            {link.label}
            <ArrowRightIcon />
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusArtwork({ tone }: { tone: StatusTone }) {
  return (
    <div aria-hidden="true" className="status-art" data-tone={tone}>
      {tone === "missing" ? <MissingRecordArtwork /> : <FailureArtwork />}
    </div>
  );
}

function MissingRecordArtwork() {
  return (
    <svg fill="none" viewBox="0 0 260 132">
      <circle cx="130" cy="66" r="54" stroke="#c7d2fe" strokeDasharray="3 7" strokeWidth="1.5" />

      <rect fill="#e0e7ff" height="82" opacity="0.6" rx="14" width="86" x="78" y="22" />
      <rect fill="#ffffff" height="82" rx="14" stroke="#dbe4f0" width="86" x="74" y="18" />
      <rect fill="#eef2ff" height="20" rx="7" width="58" x="88" y="30" />
      <rect fill="#c7d2fe" height="6" rx="3" width="46" x="88" y="60" />
      <rect fill="#e2e8f0" height="6" rx="3" width="58" x="88" y="72" />
      <rect height="14" rx="7" stroke="#a5b4fc" strokeDasharray="4 4" width="58" x="88" y="84" />

      <g className="status-art-float">
        <circle cx="176" cy="88" fill="#eef2ff" r="21" stroke="#4f46e5" strokeWidth="4" />
        <path d="m191 103 11 11" stroke="#4f46e5" strokeLinecap="round" strokeWidth="6" />
        <path
          d="M171 84.5c0-2.8 2.2-5 5-5s5 2.2 5 5c0 3.4-5 4-5 7"
          stroke="#4f46e5"
          strokeLinecap="round"
          strokeWidth="2.6"
        />
        <circle cx="176" cy="97" fill="#4f46e5" r="1.7" />
      </g>

      <circle cx="52" cy="38" fill="#fff1f2" r="15" />
      <path d="M52 31v14M45 38h14" stroke="#e11d48" strokeLinecap="round" strokeWidth="3" />
      <circle cx="212" cy="34" fill="#ccfbf1" r="5" />
      <circle cx="42" cy="72" fill="#c7d2fe" r="3" />
      <circle cx="222" cy="76" fill="#fecdd3" r="4" />
    </svg>
  );
}

function FailureArtwork() {
  return (
    <svg fill="none" viewBox="0 0 260 132">
      <circle cx="130" cy="66" r="54" stroke="#fecdd3" strokeDasharray="3 7" strokeWidth="1.5" />

      <rect fill="#ffe4e6" height="76" opacity="0.55" rx="14" width="148" x="56" y="26" />
      <rect fill="#ffffff" height="76" rx="14" stroke="#dbe4f0" width="148" x="52" y="22" />
      <circle cx="68" cy="38" fill="#fda4af" r="3" />
      <circle cx="79" cy="38" fill="#fecdd3" r="3" />
      <path d="M52 48h148" stroke="#eef2ff" strokeWidth="1.5" />

      <path
        d="M68 76h18l6-13 8 22 7-15h9"
        stroke="#4f46e5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
      <path
        d="M124 76h12"
        stroke="#e11d48"
        strokeDasharray="3 5"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
      <path d="M144 76h10" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="2.6" />

      <g className="status-art-float">
        <path
          d="m186 68 17 27a3.4 3.4 0 0 1-3 5.1h-34a3.4 3.4 0 0 1-3-5.1l17-27a3.4 3.4 0 0 1 6 0Z"
          fill="#fff1f2"
          stroke="#e11d48"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <path d="M186 80v9" stroke="#e11d48" strokeLinecap="round" strokeWidth="3" />
        <circle cx="186" cy="95" fill="#e11d48" r="1.8" />
      </g>

      <circle cx="50" cy="42" fill="#ccfbf1" r="5" />
      <circle cx="214" cy="34" fill="#fecdd3" r="4" />
      <circle cx="40" cy="92" fill="#fecdd3" r="3" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
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
