import { AdminShell } from "@/components/layout/admin-shell";
import { ZonesManagementClient } from "./zones-management-client";

export const metadata = {
  title: "Community Zones | Aegis Admin",
  description: "Manage geofence zones, center coordinates, and default emergency blast radii",
};

export default function AdminZonesPage() {
  return (
    <AdminShell>
      <ZonesManagementClient />
    </AdminShell>
  );
}
