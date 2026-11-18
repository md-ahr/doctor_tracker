import { Suspense } from "react";

import { DoctorScreen } from "@/features/doctors/ui/doctor-screen";

export default function DoctorsPage() {
  return (
    // The screen reads filters from the URL, so it needs a boundary while the
    // static shell is prerendered.
    <Suspense fallback={null}>
      <DoctorScreen />
    </Suspense>
  );
}
