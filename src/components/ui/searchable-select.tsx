"use client";

import { Combobox } from "@base-ui/react/combobox";
import { useMemo, useState } from "react";

import { CheckIcon, ChevronDownIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { selectPopupClassName, selectTriggerClassName } from "@/components/ui/select";

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Secondary line that tells options with the same label apart. Also matched by the search box. */
  description?: string;
};

type SearchableSelectProps = {
  /** Label for the option that clears the filter, rendered first and always selectable. */
  anyLabel: string;
  className?: string;
  disabled?: boolean;
  /** Copy shown when no option matches the typed query. */
  emptyLabel?: string;
  id: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  /** Accessible name for the in-popup search box. */
  searchLabel: string;
  searchPlaceholder: string;
  size?: "field" | "compact";
  value: string;
};

const ANY_VALUE = "__any__";

/**
 * Select for long option lists: the popup opens with a search box that filters options as you
 * type. Short lists should keep using `Select`, where a search box would be extra noise.
 */
export function SearchableSelect({
  anyLabel,
  className,
  disabled = false,
  emptyLabel = "No matches",
  id,
  onValueChange,
  options,
  searchLabel,
  searchPlaceholder,
  size = "compact",
  value,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");

  const items = useMemo<SearchableSelectOption[]>(
    () => [{ label: anyLabel, value: ANY_VALUE }, ...options],
    [anyLabel, options],
  );
  const selected = items.find((item) => item.value === (value || ANY_VALUE)) ?? items[0];

  function commit(next: SearchableSelectOption | null) {
    onValueChange(next === null || next.value === ANY_VALUE ? "" : next.value);
  }

  return (
    <Combobox.Root
      autoHighlight
      disabled={disabled}
      id={id}
      inputValue={query}
      isItemEqualToValue={(item, compared) => item.value === compared.value}
      itemToStringLabel={(item) =>
        item.description ? `${item.label} · ${item.description}` : item.label
      }
      items={items}
      onInputValueChange={(next) => setQuery(next)}
      onOpenChangeComplete={(open) => {
        if (!open) setQuery("");
      }}
      onValueChange={commit}
      value={selected}
    >
      <Combobox.Trigger className={selectTriggerClassName(size, className)} data-size={size}>
        <span className="truncate">
          {selected?.label ?? anyLabel}
          {selected?.description ? (
            <span className="text-ink-tertiary"> · {selected.description}</span>
          ) : null}
        </span>
        <ChevronDownIcon className="shrink-0 text-ink-tertiary" />
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner align="start" className="z-(--layer-popup)" sideOffset={6}>
          <Combobox.Popup
            aria-label={searchLabel}
            className={selectPopupClassName("flex max-h-80 flex-col overflow-hidden p-0")}
          >
            <div className="shrink-0 border-b border-line p-1">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-2.5 grid -translate-y-1/2 place-items-center text-ink-tertiary"
                >
                  <SearchIcon size={14} />
                </span>
                <Combobox.Input
                  aria-label={searchLabel}
                  className="h-8 w-full min-w-0 rounded-lg border border-control bg-sheet pr-8 pl-8 font-sans text-[13px] text-ink outline-none placeholder:text-ink-tertiary focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  id={`${id}-search`}
                  placeholder={searchPlaceholder}
                />
                {query.length > 0 ? (
                  <button
                    aria-label="Clear search"
                    className="absolute inset-y-1 right-1 grid w-6 cursor-pointer place-items-center rounded-md text-ink-tertiary transition-colors duration-150 hover:bg-inset hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
                    onClick={() => setQuery("")}
                    onMouseDown={(event) => event.preventDefault()}
                    type="button"
                  >
                    <CloseIcon size={12} />
                  </button>
                ) : null}
              </div>
            </div>

            <Combobox.Empty>
              <p className="px-3 py-6 text-center text-xs text-ink-secondary">{emptyLabel}</p>
            </Combobox.Empty>

            <Combobox.List className="min-h-0 overflow-y-auto overscroll-contain p-1">
              {(item: SearchableSelectOption) => (
                <Combobox.Item
                  className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[13px] outline-none data-disabled:pointer-events-none data-highlighted:bg-inset data-selected:bg-selected data-selected:text-action"
                  key={item.value}
                  value={item}
                >
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate">{item.label}</span>
                    {item.description ? (
                      <span className="truncate text-[11px] text-ink-tertiary">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  <Combobox.ItemIndicator className="shrink-0 pl-2 text-action">
                    <CheckIcon />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
