import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/app/providers";
import { displayFont, uiFont } from "@/lib/fonts";
import "@/lib/time/temporal";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Doctor Tracker",
    template: "%s · Doctor Tracker",
  },
  description:
    "Admin portal for the Doctor Tracker directory: manage doctors and patients, and review registration counts in one place.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={`${displayFont.variable} ${uiFont.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
