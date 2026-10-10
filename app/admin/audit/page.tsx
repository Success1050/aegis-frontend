import { AdminShell } from "@/components/layout/admin-shell";
import { AuditTimelineClient } from "./audit-timeline-client";

export const metadata = {
  title: "Audit Timeline | Aegis Admin",
  description: "Tamper-evident append-only timeline of security events and state change diffs",
};

export default function AdminAuditPage() {
  return (
    <AdminShell>
      <AuditTimelineClient />
    </AdminShell>
  );
}
