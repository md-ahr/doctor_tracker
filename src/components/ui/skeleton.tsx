import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * A quiet block that stands in for content while a request is in flight.
 * It is always decorative; the surrounding region carries the busy state.
 */
export function Skeleton({ className, ...props }: ComponentProps<"span">) {
  return <span aria-hidden="true" className={cn("skeleton", className)} {...props} />;
}
