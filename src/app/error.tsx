"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { StatusScreen } from "@/features/system/ui/status-screen";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <StatusScreen
      badge="Something went wrong"
      description="An unexpected problem interrupted this screen. Nothing in the directory was lost — try the request again, or return to the dashboard if it keeps happening."
      reference={
        error.digest ? (
          <>
            <span>Reference</span>
            <code>{error.digest}</code>
          </>
        ) : null
      }
      title="We couldn't finish loading this page"
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
