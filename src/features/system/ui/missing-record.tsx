import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/features/system/ui/back-button";
import { StatusScreen } from "@/features/system/ui/status-screen";

export type MissingRecordKind = "doctor" | "page";

type MissingRecordCopy = {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
};

const copyByKind: Record<MissingRecordKind, MissingRecordCopy> = {
  doctor: {
    title: "This doctor isn't in the directory",
    description:
      "The record may have been removed, or the link is out of date. Browse the directory to find the doctor you need.",
    actionHref: "/doctors",
    actionLabel: "Back to doctors",
  },
  page: {
    title: "We couldn't find that record",
    description:
      "This record may have been removed, or the link is out of date. The rest of the directory is still available.",
    actionHref: "/dashboard",
    actionLabel: "Back to dashboard",
  },
};

type MissingRecordProps = {
  /** Tailors the copy and the way back to the record that went missing. */
  kind?: MissingRecordKind;
};

/**
 * The 404 view inside the portal shell. Shared by segment `not-found` files
 * and by client screens that discover a missing record from an API response.
 */
export function MissingRecord({ kind = "page" }: MissingRecordProps) {
  const copy = copyByKind[kind];

  return (
    <StatusScreen
      badge="Error 404"
      description={copy.description}
      layout="embedded"
      quickLinks
      title={copy.title}
      tone="missing"
      actions={
        <>
          <Link className={buttonVariants()} href={copy.actionHref}>
            {copy.actionLabel}
          </Link>
          <BackButton />
        </>
      }
    />
  );
}
