"use client";

import { useState, type ReactNode } from "react";
import type { Matcher } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "@/components/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  formatCalendarDate,
  fromCalendarDate,
  toCalendarDate,
  todayCalendarDate,
} from "@/lib/time/date-picker";

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
  size?: "compact" | "field";
  required?: boolean;
  /** Oldest canonical plain date the calendar offers. */
  minDate?: string;
  /** Newest canonical plain date the calendar offers. */
  maxDate?: string;
};

/**
 * Date input: a formatted field that opens a calendar popover.
 * Values are canonical plain dates (`YYYY-MM-DD`) so they stay URL-safe.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  invalid = false,
  describedBy,
  className,
  size = "compact",
  required = false,
  minDate,
  maxDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const min = toCalendarDate(minDate ?? "");
  const max = toCalendarDate(maxDate ?? "");
  const disabledDays: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
  ];

  const selected = toCalendarDate(value);
  const [month, setMonth] = useState<Date>(() =>
    clampToBounds(selected ?? todayCalendarDate(), min, max),
  );

  const display = formatCalendarDate(value);
  const today = todayCalendarDate();
  const todayAllowed = isWithinBounds(today, min, max);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setMonth(clampToBounds(toCalendarDate(value) ?? today, min, max));
    }
    setOpen(nextOpen);
  }

  function select(date: Date | undefined) {
    onChange(date ? fromCalendarDate(date) : "");
    setOpen(false);
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  function selectToday() {
    setMonth(today);
    select(today);
  }

  return (
    <div className={cn("relative", className)}>
      <Popover onOpenChange={handleOpenChange} open={open}>
        <PopoverTrigger
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-label={`${label} date`}
          aria-required={required || undefined}
          className={cn(
            "group flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-(--radius-control) border border-control bg-sheet px-3 text-left font-sans text-[13px] transition-colors duration-150 outline-none hover:border-[#cfd9e8] focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-danger aria-invalid:bg-danger-wash data-popup-open:border-focus",
            size === "field" ? "h-(--control-height)" : "h-(--control-height-compact)",
          )}
          id={id}
        >
          <CalendarIcon className="shrink-0 text-ink-tertiary" />
          <span
            className={cn(
              "min-w-0 flex-1 truncate tabular-nums",
              display.length > 0 ? "pr-5 text-ink" : "text-ink-tertiary",
            )}
          >
            {display.length > 0 ? display : "Select date"}
          </span>
          {/* Same icon slot as `SelectTrigger`, so both fields end with an identical chevron. */}
          <span
            aria-hidden="true"
            className="grid size-3.5 shrink-0 place-items-center text-ink-tertiary"
          >
            {display.length > 0 ? null : <ChevronDownIcon />}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" sideOffset={6}>
          <Calendar
            autoFocus
            captionLayout="dropdown"
            disabled={disabledDays.length > 0 ? disabledDays : undefined}
            endMonth={max}
            month={month}
            mode="single"
            onMonthChange={(next) => setMonth(clampToBounds(next, min, max))}
            onSelect={select}
            required
            selected={selected}
            startMonth={min}
          />
          <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5">
            <FooterAction onClick={clear}>Clear</FooterAction>
            {todayAllowed ? (
              <FooterAction onClick={selectToday} tone="action">
                Today
              </FooterAction>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {display.length > 0 ? (
        <button
          aria-label={`Clear ${label.toLowerCase()} date`}
          className="absolute inset-y-1 right-1.5 grid w-7 cursor-pointer place-items-center rounded-lg text-ink-tertiary transition-colors duration-150 hover:bg-inset hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
          onClick={clear}
          type="button"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}

function isWithinBounds(date: Date, min?: Date, max?: Date): boolean {
  if (min && date.getTime() < min.getTime()) return false;
  if (max && date.getTime() > max.getTime()) return false;
  return true;
}

function clampToBounds(date: Date, min?: Date, max?: Date): Date {
  if (min && date.getTime() < min.getTime()) return min;
  if (max && date.getTime() > max.getTime()) return max;
  return date;
}

function FooterAction({
  children,
  onClick,
  tone = "neutral",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "action";
}) {
  return (
    <button
      className={cn(
        "cursor-pointer rounded-md px-1.5 py-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
        tone === "action"
          ? "text-action hover:text-action-hover"
          : "text-ink-secondary hover:text-ink",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="15"
      viewBox="0 0 24 24"
      width="15"
    >
      <rect height="16" rx="3" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" />
      <path
        d="M8 3v4M16 3v4M3 10h18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="13" viewBox="0 0 24 24" width="13">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
