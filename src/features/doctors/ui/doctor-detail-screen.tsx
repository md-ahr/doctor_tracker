"use client";

import { Suspense } from "react";

import { useDoctor } from "@/features/doctors/hooks/use-doctor";
import { DoctorSummary } from "@/features/doctors/ui/doctor-summary";
import { PatientScreen } from "@/features/patients/ui/patient-screen";
import { MissingRecord } from "@/features/system/ui/missing-record";
import { isMissingRecordError } from "@/lib/api/errors";

type DoctorDetailScreenProps = {
  doctorId: string;
};

export function DoctorDetailScreen({ doctorId }: DoctorDetailScreenProps) {
  const doctor = useDoctor(doctorId);

  // The id is well formed but the record is gone: show the 404 view instead of
  // an error band, and skip the patient list that could never load.
  if (isMissingRecordError(doctor.error)) {
    return <MissingRecord kind="doctor" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <DoctorSummary doctorId={doctorId} />
      <Suspense fallback={null}>
        <PatientScreen doctorId={doctorId} doctorName={doctor.data?.name} />
      </Suspense>
    </div>
  );
}
