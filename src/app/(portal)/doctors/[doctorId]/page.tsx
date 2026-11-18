import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DoctorDetailScreen } from "@/features/doctors/ui/doctor-detail-screen";
import { isRecordId } from "@/lib/record-id";

export const metadata: Metadata = {
  title: "Doctor details",
  description: "Review a doctor's details and manage the patients assigned to them.",
};

type DoctorDetailPageProps = {
  params: Promise<{ doctorId: string }>;
};

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { doctorId } = await params;

  if (!isRecordId(doctorId)) notFound();

  return <DoctorDetailScreen doctorId={doctorId} />;
}
