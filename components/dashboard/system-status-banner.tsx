"use client";

import * as React from "react";
import { useCircuitBreakerQuery, useQueueStatsQuery, useAdminDashboardQuery } from "@/hooks/queries/use-dashboard";
import { AlertTriangle, AlertCircle, PauseCircle, ShieldAlert } from "lucide-react";

export function SystemStatusBanner() {
  const { data: circuit } = useCircuitBreakerQuery();
  const { data: queue } = useQueueStatsQuery();
  const { data: adminStats } = useAdminDashboardQuery();

  const isCircuitBroken = circuit?.state === "OPEN" || circuit?.state === "HALF_OPEN";
  const isQueuePaused = queue?.paused === true || adminStats?.systemStatus?.queuePaused === true;
  const hasUnreviewedTemplates = adminStats?.hasUnreviewedTemplates === true;

  if (!isCircuitBroken && !isQueuePaused && !hasUnreviewedTemplates) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      {isQueuePaused && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/60 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2.5 font-semibold">
            <PauseCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              EMERGENCY WARNING: Alert dispatch queue is currently <strong>PAUSED</strong>. Outgoing emergency broadcasts are being held.
            </span>
          </div>
        </div>
      )}

      {isCircuitBroken && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border-2 border-red-500/60 text-red-900 dark:text-red-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>
              SMS PROVIDER OUTAGE: Carrier Circuit Breaker is <strong>{circuit?.state}</strong> due to consecutive gateway errors.
            </span>
          </div>
        </div>
      )}

      {hasUnreviewedTemplates && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-900 dark:text-blue-200 flex items-center gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            Compliance Advisory: One or more local language templates are flagged as <strong>NEEDS_NATIVE_REVIEW</strong>. Standard English verified templates will be used as safety fallback.
          </span>
        </div>
      )}
    </div>
  );
}
