import { Suspense } from "react";

import { PatientScreen } from "@/features/patients/ui/patient-screen";

export default function PatientsPage() {
  return (
    // The screen reads filters from the URL, so it needs a boundary while the
    // static shell is prerendered.
    <Suspense fallback={null}>
      <PatientScreen />
    </Suspense>
  );
}
