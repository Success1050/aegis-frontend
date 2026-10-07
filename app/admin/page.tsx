import { AdminShell } from "@/components/layout/admin-shell";
import { AdminDashboardClient } from "./admin-dashboard-client";

export const metadata = {
  title: "System Administration | Aegis Governance",
  description: "Global system overview, carrier status, and community management",
};

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminDashboardClient />
    </AdminShell>
  );
}
