"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { enGB } from "react-day-picker/locale";

import { cn } from "@/lib/utils";

const NAV_BUTTON =
  "grid size-8 cursor-pointer place-items-center rounded-lg text-ink-secondary transition-colors duration-150 hover:bg-inset hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-disabled:pointer-events-none aria-disabled:opacity-30";

const DROPDOWN_ROOT =
  "relative inline-flex cursor-pointer items-center rounded-lg transition-colors duration-150 hover:bg-inset has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      locale={enGB}
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn("w-fit p-3 font-sans select-none", className)}
      classNames={{
        months: "relative",
        month: "flex flex-col gap-1.5",
        month_caption: "flex h-10 items-center justify-center px-10",
        caption_label:
          "inline-flex items-center gap-0.5 px-1.5 py-1 text-[13px] font-semibold text-ink",
        dropdowns: "flex h-10 items-center justify-center gap-0.5",
        dropdown_root: DROPDOWN_ROOT,
        dropdown: "absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0",
        months_dropdown: "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0",
        years_dropdown: "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0",
        nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between",
        button_previous: NAV_BUTTON,
        button_next: NAV_BUTTON,
        chevron: "size-3 text-ink-tertiary",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 pb-1.5 text-center text-[10px] font-semibold tracking-[0.09em] text-ink-tertiary uppercase",
        week: "mt-0.5 flex w-full",
        day: "h-9 w-9 p-0 text-center align-middle",
        day_button:
          "mx-auto grid size-9 cursor-pointer place-items-center rounded-[10px] text-[13px] font-medium tracking-normal text-ink normal-case tabular-nums transition-colors duration-150 outline-none hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
        selected:
          "[&>button]:bg-action [&>button]:font-semibold [&>button]:text-action-fg [&>button]:shadow-[0_8px_16px_-10px_rgba(79,70,229,0.9)] [&>button:hover]:bg-action-hover",
        today:
          "[&>button]:font-semibold [&>button]:text-action [&>button]:ring-1 [&>button]:ring-action/30 [&>button]:ring-inset",
        outside: "[&>button]:text-ink-tertiary/55",
        disabled: "[&>button]:pointer-events-none [&>button]:text-ink-tertiary/30",
        hidden: "invisible",
        footer: "pt-2 text-center text-xs text-ink-secondary",
        ...classNames,
      }}
      {...props}
    />
  );
}

export type { DayPickerProps as CalendarProps };
