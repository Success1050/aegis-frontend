import { OfficerShell } from "@/components/layout/officer-shell";
import { IncidentDetailClient } from "./incident-detail-client";

export const metadata = {
  title: "Incident Operations & Verification | Aegis",
  description: "Tactical verification, recipient preview, and live alert delivery tracking",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IncidentDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <OfficerShell>
      <IncidentDetailClient id={id} />
    </OfficerShell>
  );
}
