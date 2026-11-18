"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { StatusScreen } from "@/features/system/ui/status-screen";

type PortalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Keeps the navigation in place so one failed view never strands the user. */
export default function PortalError({ error, reset }: PortalErrorProps) {
  return (
    <StatusScreen
      badge="Something went wrong"
      description="This view couldn't be loaded, but the rest of the workspace is still available. Try again, or open another section from the menu."
      layout="embedded"
      reference={
        error.digest ? (
          <>
            <span>Reference</span>
            <code>{error.digest}</code>
          </>
        ) : null
      }
      title="We hit a snag loading this view"
      tone="failure"
      actions={
        <>
          <Button onClick={() => reset()}>Try again</Button>
          <Link className={buttonVariants({ variant: "secondary" })} href="/dashboard">
            Back to dashboard
          </Link>
        </>
      }
    />
  );
}
