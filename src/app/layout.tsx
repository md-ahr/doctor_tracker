import type { ReactNode } from "react";

import { Providers } from "@/app/providers";
import { displayFont, uiFont } from "@/lib/fonts";

import "./globals.css";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={`${displayFont.variable} ${uiFont.variable}`} lang="en">
      <body>
        <Providers>
          <main className="content-column">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
