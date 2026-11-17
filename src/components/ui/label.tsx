import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("font-sans text-xs leading-none font-semibold text-ink-secondary", className)}
      {...props}
    />
  );
}

export { Label };
