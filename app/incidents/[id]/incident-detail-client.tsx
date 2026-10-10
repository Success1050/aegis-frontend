"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useIncidentDetailQuery } from "@/hooks/queries/use-incidents";
import { TwoOfficerVerificationModal } from "@/components/incidents/two-officer-verification-modal";
import { DismissIncidentModal } from "@/components/incidents/dismiss-incident-modal";
import { ResolveIncidentModal } from "@/components/incidents/resolve-incident-modal";
import { AlertDeliveryTracker } from "@/components/incidents/alert-delivery-tracker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { MaskedPhone } from "@/components/ui/masked-phone";
import { LoadingState } from "@/components/ui/loading-state";
import { getThreatPresentation } from "@/lib/incident-threat";
import {
  ShieldAlert,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Radio,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface IncidentDetailClientProps {
  id: string;
}

export function IncidentDetailClient({ id }: IncidentDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: incident, isLoading, refetch } = useIncidentDetailQuery(id);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = React.useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = React.useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = React.useState(false);

  if (isLoading || !incident) {
    return <LoadingState title="Loading tactical incident details..." />;
  }

  const threat = getThreatPresentation(incident.type || incident.incidentType, incident.severity);
  const isReporter = user?.id === incident.reportedById;
  const isPending = incident.status === "PENDING_REVIEW";
  const isAlerting = incident.status === "ALERTING" || incident.status === "ALERTS_SENT";
  const isResolved = incident.status === "RESOLVED";
  const isDismissed = incident.status === "DISMISSED";

  const incidentNum = incident.incidentNumber || incident.number || "INCIDENT";
  const reportedDate = incident.reportedAt || incident.createdAt;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Command Feed
        </Button>

        <div className="flex items-center gap-2">
          {/* Action Triggers according to incident state */}
          {isPending && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500/50 hover:bg-red-500/10 text-xs gap-1.5"
                onClick={() => setIsDismissModalOpen(true)}
              >
                <XCircle className="w-3.5 h-3.5" />
                Dismiss Report
              </Button>

              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-red-950"
                onClick={() => setIsVerifyModalOpen(true)}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Verify & Dispatch Alerts
              </Button>
            </>
          )}

          {isAlerting && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
              onClick={() => setIsResolveModalOpen(true)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Resolved (All-Clear)
            </Button>
          )}
        </div>
      </div>

      {/* High-Alert Threat Card */}
      <Card
        className={
          incident.severity === "CRITICAL"
            ? "border-2 border-red-600 bg-red-950/20 shadow-xl shadow-red-950/30"
            : incident.severity === "HIGH"
            ? "border-2 border-orange-500 bg-orange-950/15"
            : "border border-amber-500/60 bg-amber-950/10"
        }
      >
        <CardHeader className="pb-3 border-b border-slate-700/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                {incidentNum}
              </span>
              <SeverityBadge severity={incident.severity} size="sm" />
              <StatusBadge status={incident.status} size="sm" />
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-red-900/60 text-red-200 border border-red-700/80">
                {threat.categoryTag}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Reported: </span>
              <FormattedWAT date={reportedDate} />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-red-100 tracking-tight mt-3 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 animate-pulse" />
            <span>{threat.headline}</span>
          </h2>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 text-xs sm:text-sm">
          {/* Situation Report */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Field Situation Report
            </span>
            <p className="text-slate-100 leading-relaxed font-sans">{incident.description}</p>
          </div>

          {/* Actionable Directive */}
          <div className="p-3.5 rounded-xl bg-red-900/40 border border-red-700/80 text-xs text-red-200 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black text-red-100 uppercase tracking-wider text-[11px]">
                Tactical Safety Directive
              </span>
              <p className="text-xs text-red-100 font-medium leading-relaxed">
                {threat.directive}
              </p>
            </div>
          </div>

          {/* Four-Eyes Officer Verification Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Reporting Officer (First Eye)
              </span>
              <p className="font-semibold text-slate-200">
                {incident.reportedByName || incident.reporter?.fullName || "Duty Security Officer"}
              </p>
              {incident.reporter?.phone && (
                <p className="font-mono text-xs text-slate-400">
                  <MaskedPhone phone={incident.reporter.phone} />
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Verifying Officer (Second Eye)
              </span>
              {incident.verifiedById ? (
                <div>
                  <p className="font-semibold text-emerald-400">
                    {incident.verifiedByName || incident.verifier?.fullName || "Verified by Second Officer"}
                  </p>
                  {incident.verifiedAt && (
                    <p className="text-[11px] text-slate-400">
                      Verified at <FormattedWAT date={incident.verifiedAt} />
                    </p>
                  )}
                </div>
              ) : isDismissed ? (
                <div>
                  <p className="font-semibold text-red-400">
                    Dismissed: {incident.dismissReason || "No justification provided"}
                  </p>
                </div>
              ) : (
                <p className="font-semibold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  Awaiting Second Officer Verification
                </p>
              )}
            </div>
          </div>

          {/* Resolution Details */}
          {isResolved && incident.resolveNotes && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/80 text-xs text-emerald-200 space-y-1">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[11px]">
                Incident Resolution Debrief
              </span>
              <p className="leading-relaxed">{incident.resolveNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geofence & Location Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>Incident Geolocation & Alert Blast Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-1 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Community Ward</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {incident.zoneName || incident.zone?.name || "Immediate Monitored Ward"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Latitude</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {Number(incident.latitude).toFixed(6)}° N
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Longitude</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {Number(incident.longitude).toFixed(6)}° E
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Blast Radius</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {incident.alertRadiusMeters || incident.blastRadiusMeters || 2000} meters
              </p>
            </div>
          </div>

          {/* Interactive Map Pin Visualizer */}
          <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
            <iframe
              title="Incident Location Map"
              className="w-full h-full border-0 pointer-events-none opacity-90"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(incident.longitude) - 0.02}%2C${Number(incident.latitude) - 0.02}%2C${Number(incident.longitude) + 0.02}%2C${Number(incident.latitude) + 0.02}&layer=mapnik&marker=${incident.latitude}%2C${incident.longitude}`}
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-500/25 border-2 border-red-500 animate-ping absolute" />
                <MapPin className="w-7 h-7 text-red-600 drop-shadow-md z-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Alert Delivery Tracking (for verified / alerting / resolved incidents) */}
      {(isAlerting || isResolved) && (
        <AlertDeliveryTracker incidentId={incident.id} />
      )}

      {/* Two-Officer Verification Modal */}
      <TwoOfficerVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        incident={incident}
        onSuccess={() => refetch()}
      />

      {/* Dismiss Incident Modal */}
      <DismissIncidentModal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        incidentId={incident.id}
        incidentNumber={incidentNum}
        onSuccess={() => refetch()}
      />

      {/* Resolve Incident Modal */}
      <ResolveIncidentModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        incidentId={incident.id}
        incidentNumber={incidentNum}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
