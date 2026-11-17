"use client";

import { Label as LabelPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("font-sans text-xs leading-none font-semibold text-ink-secondary", className)}
      {...props}
    />
  );
}

export { Label };
