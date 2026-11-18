import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/features/system/ui/back-button";
import { StatusScreen } from "@/features/system/ui/status-screen";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you requested is not part of the Doctor Tracker directory.",
};

export default function NotFound() {
  return (
    <StatusScreen
      badge="Error 404"
      description="The address may be mistyped, or the record you were looking for has been moved or removed. Check the link, or pick up from one of the views below."
      quickLinks
      title="This page isn't in the directory"
      tone="missing"
      actions={
        <>
          <Link className={buttonVariants()} href="/dashboard">
            Back to dashboard
          </Link>
          <BackButton />
        </>
      }
    />
  );
}
