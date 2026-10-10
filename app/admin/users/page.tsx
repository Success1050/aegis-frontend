import { AdminShell } from "@/components/layout/admin-shell";
import { UsersManagementClient } from "./users-management-client";

export const metadata = {
  title: "User Directory & Registration | Aegis Admin",
  description: "Subscriber management, flexible dual-mode registration and bulk CSV import",
};

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UsersManagementClient />
    </AdminShell>
  );
}
