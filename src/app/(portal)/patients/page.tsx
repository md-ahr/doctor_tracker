import type { Metadata } from "next";
import { Suspense } from "react";

import { PatientScreen } from "@/features/patients/ui/patient-screen";

export const metadata: Metadata = {
  title: "Patients",
  description: "Search, filter, and manage every patient in the registry.",
};

export default function PatientsPage() {
  return (
    <Suspense fallback={null}>
      <PatientScreen />
    </Suspense>
  );
}
