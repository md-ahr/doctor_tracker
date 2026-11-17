"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultDashboardRange, isDateOrderValid } from "@/lib/time/calendar";

type DashboardRange = { from: string; to: string };

type DashboardRangeControlProps = {
  from: string;
  to: string;
  timeZone: string;
  onCommit: (range: DashboardRange) => void;
};

export function DashboardRangeControl({
  from,
  to,
  timeZone,
  onCommit,
}: DashboardRangeControlProps) {
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const reversed =
    draftFrom.length > 0 && draftTo.length > 0 && !isDateOrderValid(draftFrom, draftTo);

  function update(nextFrom: string, nextTo: string) {
    setDraftFrom(nextFrom);
    setDraftTo(nextTo);
    if (nextFrom.length > 0 && nextTo.length > 0 && isDateOrderValid(nextFrom, nextTo)) {
      onCommit({ from: nextFrom, to: nextTo });
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-2">
        <Label htmlFor="dashboard-from">From</Label>
        <Input
          aria-invalid={reversed}
          id="dashboard-from"
          onValueChange={(value) => update(value, draftTo)}
          type="date"
          value={draftFrom}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dashboard-to">To</Label>
        <Input
          aria-invalid={reversed}
          id="dashboard-to"
          onValueChange={(value) => update(draftFrom, value)}
          type="date"
          value={draftTo}
        />
      </div>
      <Button
        onClick={() => {
          const next = defaultDashboardRange(timeZone);
          update(next.from, next.to);
        }}
        type="button"
        variant="quiet"
      >
        Last 30 days
      </Button>
      {reversed ? (
        <p className="text-sm text-danger-text" role="status">
          From must be on or before To.
        </p>
      ) : null}
    </div>
  );
}
