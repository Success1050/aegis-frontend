import { ResidentShell } from "@/components/layout/resident-shell";
import { ResidentPortalClient } from "./resident-portal-client";

export const metadata = {
  title: "Community Safety Portal | Aegis Early-Warning",
  description: "Resident community status, safety notices, and multilingual alert preferences",
};

export default function PortalPage() {
  return (
    <ResidentShell>
      <ResidentPortalClient />
    </ResidentShell>
  );
}
