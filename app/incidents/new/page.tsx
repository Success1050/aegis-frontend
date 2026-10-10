import { OfficerShell } from "@/components/layout/officer-shell";
import { IncidentReportForm } from "./incident-report-form";

export const metadata = {
  title: "Report New Incident | Aegis Early-Warning",
  description: "Initiate emergency incident report for two-officer verification",
};

export default function NewIncidentPage() {
  return (
    <OfficerShell>
      <IncidentReportForm />
    </OfficerShell>
  );
}
