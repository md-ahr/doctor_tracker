import type { Metadata } from "next";

import { MissingRecord } from "@/features/system/ui/missing-record";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you requested is not part of the Doctor Tracker directory.",
};

export default function PortalNotFound() {
  return <MissingRecord />;
}
