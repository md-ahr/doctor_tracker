"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Dialog({ ...props }: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({ ...props }: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal({ ...props }: ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({ ...props }: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-(--layer-dialog) bg-[rgba(15,23,42,0.45)] backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // Centering uses the `translate` property, so the enter/exit transition only
          // touches `opacity` and `scale`. Animating `transform` here would compose with
          // the translate and visibly snap the sheet into place.
          "fixed top-1/2 left-1/2 z-(--layer-dialog) max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-(--radius-sheet) border border-line bg-sheet p-6 font-sans text-ink shadow-(--shadow-overlay) transition-[opacity,scale] duration-150 ease-out outline-none motion-reduce:transition-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Close
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-10 grid size-8 place-items-center rounded-lg text-ink-tertiary transition-colors hover:bg-inset hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          type="button"
        >
          <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
            <path
              d="m4 4 8 8M12 4l-8 8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.7"
            />
          </svg>
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 pr-8 text-left", className)} {...props} />;
}

/**
 * Pinned to the bottom edge of the sheet: the negative margins cancel the
 * popup padding so the divider runs the full width of the sheet.
 */
function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "-mx-6 -mb-6 mt-6 flex items-center justify-end gap-2 rounded-b-[calc(var(--radius-sheet)-1px)] border-t border-line bg-inset/60 px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-serif text-[20px] leading-tight font-bold tracking-[-0.02em] text-ink",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-ink-secondary", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
