import { DoctorSummary } from "@/features/doctors/ui/doctor-summary";

type DoctorDetailPageProps = {
  params: Promise<{ doctorId: string }>;
};

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { doctorId } = await params;

  return (
    <div className="flex flex-col gap-4">
      <DoctorSummary doctorId={doctorId} />
      <section className="portal-card">
        <h2>Patients</h2>
        <p className="mt-2 text-sm text-ink-secondary">
          This doctor&apos;s patients arrive with the patient list.
        </p>
      </section>
    </div>
  );
}
