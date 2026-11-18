import type { Metadata } from "next";

import { MissingRecord } from "@/features/system/ui/missing-record";

export const metadata: Metadata = {
  title: "Doctor not found",
  description: "This doctor is not in the directory, or the record has been removed.",
};

export default function DoctorNotFound() {
  return <MissingRecord kind="doctor" />;
}
