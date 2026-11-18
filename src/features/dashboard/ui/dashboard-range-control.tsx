"use client";

import { useState } from "react";

import { DateField } from "@/components/ui/date-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dashboardPresetRange,
  dashboardRangeBounds,
  dashboardRangeIssue,
  type DashboardRange,
  type DashboardRangeIssue,
  type DashboardRangePreset,
} from "@/lib/time/calendar";

type DashboardRangeChoice = DashboardRangePreset | "custom";

type DashboardRangeControlProps = {
  from: string;
  to: string;
  timeZone: string;
  onCommit: (range: DashboardRange) => void;
};

const RANGE_OPTIONS: { label: string; value: DashboardRangeChoice }[] = [
  { value: "last-7-days", label: "Last 7 days" },
  { value: "last-30-days", label: "Last 30 days" },
  { value: "last-1-year", label: "Last 1 year" },
  { value: "custom", label: "Custom range" },
];

const PRESETS: DashboardRangePreset[] = ["last-7-days", "last-30-days", "last-1-year"];

const ISSUE_MESSAGES: Record<DashboardRangeIssue, string> = {
  reversed: "From must be on or before To.",
  "too-long": "Date range cannot exceed 366 days.",
};

const ERROR_ID = "dashboard-range-error";

export function DashboardRangeControl({
  from,
  to,
  timeZone,
  onCommit,
}: DashboardRangeControlProps) {
  const [choice, setChoice] = useState<DashboardRangeChoice>(() => matchPreset(from, to, timeZone));
  const [draft, setDraft] = useState<DashboardRange>({ from, to });

  const bounds = dashboardRangeBounds(timeZone);
  const issue = dashboardRangeIssue(draft.from, draft.to);

  /** Local state always follows the draft; only a complete, API-valid window is queried. */
  function commit(next: DashboardRange) {
    setDraft(next);
    if (
      next.from.length > 0 &&
      next.to.length > 0 &&
      dashboardRangeIssue(next.from, next.to) === null
    ) {
      onCommit(next);
    }
  }

  function choose(next: DashboardRangeChoice | null) {
    if (next === null) return;
    setChoice(next);
    if (next === "custom") return;

    commit(dashboardPresetRange(next, timeZone));
  }

  return (
    <div className="range-control" data-invalid={issue !== null ? "true" : undefined}>
      <div className="range-control-row">
        <div className="range-control-select">
          <Select<DashboardRangeChoice> onValueChange={choose} value={choice}>
            <SelectTrigger
              aria-describedby={issue !== null ? ERROR_ID : undefined}
              aria-label="Date range"
              id="dashboard-range"
              size="compact"
            >
              <SelectValue>{() => rangeLabel(choice)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {choice === "custom" ? (
          <>
            <div className="range-control-field">
              <Label htmlFor="dashboard-from">From</Label>
              <DateField
                describedBy={issue !== null ? ERROR_ID : undefined}
                id="dashboard-from"
                invalid={issue !== null}
                label="From"
                maxDate={bounds.max}
                minDate={bounds.min}
                onChange={(value) => commit({ from: value, to: draft.to })}
                value={draft.from}
              />
            </div>
            <div className="range-control-field">
              <Label htmlFor="dashboard-to">To</Label>
              <DateField
                describedBy={issue !== null ? ERROR_ID : undefined}
                id="dashboard-to"
                invalid={issue !== null}
                label="To"
                maxDate={bounds.max}
                minDate={bounds.min}
                onChange={(value) => commit({ from: draft.from, to: value })}
                value={draft.to}
              />
            </div>
          </>
        ) : null}
      </div>

      {issue !== null ? (
        <p className="range-control-error" id={ERROR_ID} role="alert">
          <WarningIcon />
          {ISSUE_MESSAGES[issue]}
        </p>
      ) : null}
    </div>
  );
}

function rangeLabel(choice: DashboardRangeChoice): string {
  return RANGE_OPTIONS.find((option) => option.value === choice)?.label ?? "Custom range";
}

function matchPreset(from: string, to: string, timeZone: string): DashboardRangeChoice {
  const preset = PRESETS.find((value) => {
    const range = dashboardPresetRange(value, timeZone);
    return range.from === from && range.to === to;
  });

  return preset ?? "custom";
}

function WarningIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="13" viewBox="0 0 24 24" width="13">
      <path
        d="M12 8v5M12 17h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
