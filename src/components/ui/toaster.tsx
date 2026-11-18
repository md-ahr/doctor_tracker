"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Mounted once in the app providers. `richColors` gives success a green wash
 * and errors a brick wash, and the toast classes keep the paper theme.
 */
export function Toaster() {
  return (
    <SonnerToaster
      closeButton
      position="top-right"
      richColors
      theme="light"
      toastOptions={{
        classNames: {
          toast: "portal-toast",
          description: "portal-toast-description",
        },
      }}
    />
  );
}
