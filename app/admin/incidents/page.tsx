import { AdminShell } from "@/components/layout/admin-shell";
import { AdminIncidentsClient } from "./admin-incidents-client";

export const metadata = {
  title: "Incident Governance | Aegis Admin",
  description: "Global administrative supervision of all recorded emergency events",
};

export default function AdminIncidentsPage() {
  return (
    <AdminShell>
      <AdminIncidentsClient />
    </AdminShell>
  );
}
