import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FilterFieldProps = {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
};

export function FilterField({ label, htmlFor, className, children }: FilterFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label className="text-[11px] tracking-[0.02em]" htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
    </div>
  );
}
