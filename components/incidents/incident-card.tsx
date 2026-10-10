"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Incident } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { MaskedPhone } from "@/components/ui/masked-phone";
import { useAuthStore } from "@/stores/auth-store";
import { useIncidentStore } from "@/stores/incident-store";
import { MapPin, ShieldCheck, ArrowRight, Eye, ShieldAlert, X, AlertTriangle } from "lucide-react";
import { getThreatPresentation } from "@/lib/incident-threat";

export function IncidentCard({
  incident,
  className,
}: {
  incident: Incident;
  className?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const openVerificationModal = useIncidentStore((s) => s.openVerificationModal);
  const openDismissModal = useIncidentStore((s) => s.openDismissModal);

  const isPending = incident.status === "PENDING_REVIEW";
  const isAlerting = incident.status === "ALERTING";
  const isOfficerOrAdmin = user?.role === "SECURITY" || user?.role === "ADMIN";
  const isReporter = user?.id === incident.reportedById;
  const canVerify = isOfficerOrAdmin && (!isReporter || user?.role === "ADMIN");

  const threat = getThreatPresentation(incident.type || incident.incidentType, incident.severity);
  const timeVal = incident.createdAt || incident.reportedAt;
  const numberVal = incident.number || incident.incidentNumber || "INC-RECORD";
  const areaVal = incident.zoneName || incident.zone?.name || "Immediate Coordinates";
  const radiusVal = incident.alertRadiusMeters || incident.blastRadiusMeters || 1000;
  const displayTitle = incident.title || threat.headline;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md border",
        isPending && "border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10",
        isAlerting && "border-purple-300 dark:border-purple-800/80 bg-purple-50/20 dark:bg-purple-950/10",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
              {numberVal}
            </span>
            <SeverityBadge severity={incident.severity} size="sm" />
            <StatusBadge status={incident.status} size="sm" />
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {threat.categoryTag}
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400" title={formatRelativeTime(timeVal)}>
            <FormattedWAT date={timeVal} />
          </div>
        </div>

        <Link
          href={`/incidents/${incident.id}`}
          className="text-base font-bold text-slate-900 dark:text-slate-100 hover:underline mt-1 flex items-center gap-2"
        >
          {incident.severity === "CRITICAL" && (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
          )}
          <span>{displayTitle}</span>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          {incident.description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{areaVal}</span>
            </span>
            <span>•</span>
            <span>Radius: {radiusVal}m</span>
          </div>

          <div>
            <span>Reported by: </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {incident.reporter?.fullName || <MaskedPhone phone={incident.reporter?.phone} />}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <Link href={`/incidents/${incident.id}`}>
            <Button variant="ghost" size="sm" className="text-xs">
              <Eye className="w-3.5 h-3.5 mr-1" />
              View Details
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {isPending && isOfficerOrAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-slate-600"
                  onClick={() => openDismissModal(incident.id)}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Dismiss
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs bg-red-600 hover:bg-red-700"
                  disabled={!canVerify}
                  title={
                    !canVerify
                      ? "Four-eyes policy: You cannot verify an incident you reported"
                      : "Verify recipient list and send mass alerts"
                  }
                  onClick={() => openVerificationModal(incident.id)}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {isReporter ? "Requires 2nd Officer" : "Verify & Fanout"}
                </Button>
              </>
            )}

            {!isPending && (
              <Link href={`/incidents/${incident.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <span>Audit Trail</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
