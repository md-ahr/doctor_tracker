"use client";

import { Select as SelectPrimitive, type SelectRootProps } from "@base-ui/react/select";
import type { ComponentProps } from "react";

import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

function Select<Value>(props: SelectRootProps<Value>) {
  return <SelectPrimitive.Root<Value> {...props} />;
}

function SelectGroup({ ...props }: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group {...props} />;
}

function SelectValue({ ...props }: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />;
}

type SelectTriggerSize = "field" | "compact";

/**
 * Base UI also accepts function class names for state-driven styling. Every caller here passes a
 * plain string, so shared trigger/popup styles compose string class names only.
 */
function asStringClassName(className: unknown): string | undefined {
  return typeof className === "string" ? className : undefined;
}

/** Trigger styling shared by `Select` and `SearchableSelect` so both look identical. */
export function selectTriggerClassName(
  size: SelectTriggerSize,
  className?: ComponentProps<typeof SelectPrimitive.Trigger>["className"],
) {
  return cn(
    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-(--radius-control) border border-control bg-sheet px-3 font-sans text-[13px] text-ink transition-colors duration-150 outline-none select-none hover:border-[#cfd9e8] focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:bg-inset disabled:text-ink-secondary data-[popup-open]:border-focus data-placeholder:text-ink-tertiary aria-invalid:border-danger aria-invalid:bg-danger-wash data-[size=compact]:h-(--control-height-compact) data-[size=field]:h-(--control-height)",
    asStringClassName(className),
  );
}

/** Popup styling shared by `Select` and `SearchableSelect` so both look identical. */
export function selectPopupClassName(
  className?: ComponentProps<typeof SelectPrimitive.Popup>["className"],
) {
  return cn(
    "max-h-80 min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-(--radius-sheet) border border-line bg-sheet p-1 text-ink shadow-(--shadow-overlay) outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
    asStringClassName(className),
  );
}

function SelectTrigger({
  className,
  size = "field",
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: SelectTriggerSize;
}) {
  return (
    <SelectPrimitive.Trigger
      data-size={size}
      className={selectTriggerClassName(size, className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="shrink-0 text-ink-tertiary" />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="z-(--layer-popup)">
        <SelectPrimitive.Popup className={selectPopupClassName(className)} {...props}>
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      className={cn("px-3 py-1 text-xs font-semibold text-ink-secondary", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[13px] outline-none data-disabled:pointer-events-none data-highlighted:bg-inset data-selected:bg-selected data-selected:text-action",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="shrink-0 pl-2 text-action">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("h-px bg-line", className)} {...props} />;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
      <path
        d="m5 12.5 4.5 4.5L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}
