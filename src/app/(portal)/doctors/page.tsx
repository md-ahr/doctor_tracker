import type { Metadata } from "next";
import { Suspense } from "react";

import { DoctorScreen } from "@/features/doctors/ui/doctor-screen";

export const metadata: Metadata = {
  title: "Doctors",
  description: "Search, filter, and manage every doctor in the directory.",
};

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorScreen />
    </Suspense>
  );
}
