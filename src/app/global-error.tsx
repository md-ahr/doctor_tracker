"use client";

import { displayFont, uiFont } from "@/lib/fonts";

import { Button, buttonVariants } from "@/components/ui/button";
import { StatusScreen } from "@/features/system/ui/status-screen";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Last-resort boundary: the root layout failed, so this file owns the document
 * shell and cannot rely on the portal's providers or navigation.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html className={`${displayFont.variable} ${uiFont.variable}`} lang="en">
      <body>
        <StatusScreen
          badge="Application error"
          description="The app couldn't render its main layout. Reload to start fresh — your saved records are untouched."
          reference={
            error.digest ? (
              <>
                <span>Reference</span>
                <code>{error.digest}</code>
              </>
            ) : null
          }
          title="Doctor Tracker needs a refresh"
          tone="failure"
          actions={
            <>
              <Button onClick={() => reset()}>Try again</Button>
              <a className={buttonVariants({ variant: "secondary" })} href="/dashboard">
                Reload the app
              </a>
            </>
          }
        />
      </body>
    </html>
  );
}
