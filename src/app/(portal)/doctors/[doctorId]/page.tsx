"use client";

import { use } from "react";

import { useDoctor } from "@/features/doctors/hooks/use-doctor";
import { DoctorSummary } from "@/features/doctors/ui/doctor-summary";
import { PatientScreen } from "@/features/patients/ui/patient-screen";

type DoctorDetailPageProps = {
  params: Promise<{ doctorId: string }>;
};

export default function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { doctorId } = use(params);
  const doctor = useDoctor(doctorId);

  return (
    <div className="flex flex-col gap-4">
      <DoctorSummary doctorId={doctorId} />
      <PatientScreen doctorId={doctorId} doctorName={doctor.data?.name} />
    </div>
  );
}
