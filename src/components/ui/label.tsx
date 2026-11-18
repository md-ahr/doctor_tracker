import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type LabelProps = ComponentProps<"label"> & {
  /** Marks the field as required with a red asterisk beside the label. */
  required?: boolean;
};

function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("font-sans text-xs leading-none font-semibold text-ink-secondary", className)}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-0.5 text-danger-text">
          *
        </span>
      ) : null}
    </label>
  );
}

export { Label };
