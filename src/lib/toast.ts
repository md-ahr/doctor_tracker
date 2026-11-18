import { toast } from "sonner";

import { errorMessage } from "@/lib/api/error-message";

/**
 * One place for the portal's toast copy, so a mutation and the button that
 * triggered it cannot disagree about what happened. Error descriptions come
 * from the shared API message helper.
 */
export function notifySuccess(title: string, description?: string): void {
  if (description) {
    toast.success(title, { description });
    return;
  }
  toast.success(title);
}

export function notifyError(title: string, error: unknown, fallback: string): void {
  toast.error(title, { description: errorMessage(error, fallback) });
}
