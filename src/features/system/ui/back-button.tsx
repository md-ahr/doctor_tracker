"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type BackButtonProps = {
  children?: ReactNode;
};

/** Returns to the previous screen without leaving the portal. */
export function BackButton({ children = "Go back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} type="button" variant="secondary">
      {children}
    </Button>
  );
}
