import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center px-4 font-sans text-[15px] leading-none font-semibold whitespace-nowrap transition-colors duration-[120ms] ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:bg-inset disabled:text-ink-secondary",
  {
    variants: {
      variant: {
        primary: "bg-action text-action-fg hover:bg-action-hover",
        secondary: "border border-control bg-sheet text-ink hover:bg-inset",
        quiet: "bg-transparent text-ink-secondary hover:bg-inset hover:text-ink",
        dangerQuiet: "bg-transparent text-danger-text hover:bg-danger-wash",
        danger: "bg-danger text-danger-fg hover:bg-[color-mix(in_srgb,var(--danger-bg)_92%,black)]",
      },
      size: {
        default: "h-[var(--control-height)] rounded-[var(--radius-control)]",
        compact: "h-[var(--control-height-compact)] rounded-[var(--radius-control)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}

export { Button, buttonVariants };
