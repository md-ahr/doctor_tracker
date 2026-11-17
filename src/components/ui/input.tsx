import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      className={cn(
        "h-[var(--control-height)] w-full min-w-0 rounded-[var(--radius-control)] border border-control bg-sheet px-3 font-sans text-[15px] text-ink outline-none placeholder:text-ink-tertiary focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:bg-inset disabled:text-ink-secondary aria-invalid:border-danger aria-invalid:bg-danger-wash",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
