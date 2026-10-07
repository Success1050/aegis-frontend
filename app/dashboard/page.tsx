import { HydrationBoundary } from "@tanstack/react-query";
import { prefetchIncidentsData } from "@/lib/server/prefetch";
import { OfficerShell } from "@/components/layout/officer-shell";
import { OfficerDashboardClient } from "./officer-dashboard-client";

export const metadata = {
  title: "Officer Command Center | Aegis Early-Warning",
  description: "Real-time tactical incident stream and emergency alert dispatch",
};

export default async function DashboardPage() {
  // Leverage Next.js Server Components to prefetch incident data on the server
  const dehydratedState = await prefetchIncidentsData();

  return (
    <OfficerShell>
      <HydrationBoundary state={dehydratedState}>
        <OfficerDashboardClient />
      </HydrationBoundary>
    </OfficerShell>
  );
}
