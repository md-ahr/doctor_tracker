import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 px-4 font-sans text-[13px] leading-none font-semibold whitespace-nowrap transition-all duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:translate-y-px disabled:pointer-events-none disabled:bg-inset disabled:text-ink-secondary",
  {
    variants: {
      variant: {
        primary:
          "bg-action text-action-fg shadow-[0_10px_22px_-14px_rgba(79,70,229,0.85)] hover:bg-action-hover",
        secondary: "border border-control bg-sheet text-ink hover:border-[#cfd9e8] hover:bg-inset",
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
  type = "button",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  );
}

export { Button, buttonVariants };
