"use client";

import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchField({ id, value, onChange, placeholder, className }: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 grid -translate-y-1/2 place-items-center text-ink-tertiary"
      >
        <SearchIcon />
      </span>
      <Input
        className="h-(--control-height-compact) pr-9 pl-9 hover:border-[#cfd9e8]"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {value.length > 0 ? (
        <button
          aria-label="Clear search"
          className="absolute inset-y-1 right-1 grid w-7 cursor-pointer place-items-center rounded-lg text-ink-tertiary transition-colors duration-150 hover:bg-inset hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
          onClick={() => onChange("")}
          type="button"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
