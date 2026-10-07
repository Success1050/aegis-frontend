"use client";

import * as React from "react";
import Link from "next/link";
import { useIncidentsQuery, useIncidentDetailQuery, useVerifyIncidentMutation, useDismissIncidentMutation } from "@/hooks/queries/use-incidents";
import { useRecipientPreviewQuery } from "@/hooks/queries/use-incidents";
import { useIncidentStore } from "@/stores/incident-store";
import { useAuthStore } from "@/stores/auth-store";
import { IncidentCard } from "@/components/incidents/incident-card";
import { IncidentFiltersBar } from "@/components/incidents/incident-filters-bar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { SeverityBadge } from "@/components/ui/badge";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { LoadingState, EmptyState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import {
  AlertTriangle,
  Radio,
  Users,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlusCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export function OfficerDashboardClient() {
  const toast = useToast();
  const { user } = useAuthStore();
  const {
    filters,
    verificationModalIncidentId,
    closeVerificationModal,
    dismissModalIncidentId,
    closeDismissModal,
  } = useIncidentStore();

  const { data: incidentPage, isLoading, refetch } = useIncidentsQuery(filters);
  const incidents = incidentPage?.data || [];

  // Verification mutations
  const verifyMutation = useVerifyIncidentMutation();
  const dismissMutation = useDismissIncidentMutation();
  const [dismissReason, setDismissReason] = React.useState("");

  // Target incident for verification modal
  const { data: verifyIncident } = useIncidentDetailQuery(
    verificationModalIncidentId || ""
  );
  const { data: previewData, isLoading: previewLoading } = useRecipientPreviewQuery(
    verificationModalIncidentId || "",
    !!verificationModalIncidentId
  );

  // Compute operational metric counts
  const pendingCount = incidents.filter((i) => i.status === "PENDING_REVIEW").length;
  const alertingCount = incidents.filter((i) => i.status === "ALERTING").length;
  const sentTodayCount = incidents.filter((i) => i.status === "ALERTS_SENT").length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;

  const handleConfirmVerification = async () => {
    if (!verificationModalIncidentId) return;
    try {
      await verifyMutation.mutateAsync({
        incidentId: verificationModalIncidentId,
      });
      toast.success(
        `Incident ${verifyIncident?.incidentNumber} verified. SMS alert dispatch initiated!`,
        "Alert Blast Triggered"
      );
      closeVerificationModal();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to verify incident",
        "Verification Error"
      );
    }
  };

  const handleConfirmDismissal = async () => {
    if (!dismissModalIncidentId || !dismissReason.trim()) return;
    try {
      await dismissMutation.mutateAsync({
        incidentId: dismissModalIncidentId,
        dismissReason: dismissReason.trim(),
      });
      toast.info("Incident dismissed successfully.", "Dismissed");
      setDismissReason("");
      closeDismissModal();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to dismiss incident",
        "Dismissal Error"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Tactical Command Feed</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time emergency monitoring • High-contrast officer console
          </p>
        </div>

        <Link href="/incidents/new">
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2">
            <PlusCircle className="w-4 h-4" />
            REPORT NEW INCIDENT
          </Button>
        </Link>
      </div>

      {/* Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Review */}
        <div className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/30 space-y-1">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>PENDING REVIEW</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-amber-200">{pendingCount}</div>
          <p className="text-[11px] text-amber-400/80">Requires second officer verify</p>
        </div>

        {/* Active Blast / Alerting */}
        <div className="p-4 rounded-xl border border-purple-900/60 bg-purple-950/30 space-y-1">
          <div className="flex items-center justify-between text-purple-400 text-xs font-semibold">
            <span>ACTIVE ALERTING</span>
            <Radio className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-purple-200">{alertingCount}</div>
          <p className="text-[11px] text-purple-400/80">BullMQ SMS dispatch in progress</p>
        </div>

        {/* Alerts Sent Today */}
        <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/30 space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>ALERTS BROADCAST</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-200">{sentTodayCount}</div>
          <p className="text-[11px] text-emerald-400/80">Community alerted successfully</p>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>RESOLVED</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-slate-200">{resolvedCount}</div>
          <p className="text-[11px] text-slate-400">All-clear issued or resolved</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
        <IncidentFiltersBar />
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState title="Loading live tactical feed..." />
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Incidents Reported"
            description="Your monitored zone is currently secure. Any new reports will trigger real-time audio and visual cues immediately."
            action={
              <Link href="/incidents/new">
                <Button size="sm" variant="outline">
                  Report First Incident
                </Button>
              </Link>
            }
          />
        ) : (
          incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        )}
      </div>

      {/* Two-Officer Verification & Blast Preview Modal */}
      <Modal
        isOpen={!!verificationModalIncidentId}
        onClose={closeVerificationModal}
        size="lg"
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>Two-Officer Blast Verification</span>
          </div>
        }
        description={`Dry-run recipient preview for incident ${verifyIncident?.incidentNumber || ""}`}
      >
        {previewLoading || !previewData ? (
          <LoadingState title="Calculating dual-pillar blast radius..." />
        ) : (
          <div className="space-y-4 pt-2">
            {/* Recipient Target Counters */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <p className="text-xs text-slate-500">Total Deduplicated</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {previewData.totalRecipients}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40">
                <p className="text-xs text-blue-600 dark:text-blue-400">Physical GPS Nearby</p>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                  {previewData.physicallyNearbyCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40">
                <p className="text-xs text-purple-600 dark:text-purple-400">Zone Members</p>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
                  {previewData.communityMemberCount}
                </p>
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Multilingual SMS Distribution
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(previewData.languageBreakdown).map(([lang, count]) => (
                  <span
                    key={lang}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300"
                  >
                    {lang}: <strong className="font-bold">{count}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Estimated Segments & Cost */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Estimated SMS Segments: {previewData.estimatedSegments}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  Forecast Cost: ₦{previewData.estimatedCostNgn.toLocaleString()} NGN
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 font-bold text-emerald-900 dark:text-emerald-100">
                NO COORDINATE LEAK
              </span>
            </div>

            {/* Native Review Warning */}
            {previewData.requiresNativeReviewWarning && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Notice: Some translated SMS templates are pending native speaker review, but will fallback safely to standard English template.
                </span>
              </div>
            )}

            <ModalFooter>
              <Button
                variant="outline"
                onClick={closeVerificationModal}
                disabled={verifyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                isLoading={verifyMutation.isPending}
                onClick={handleConfirmVerification}
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Confirm & Dispatch Alerts ({previewData.totalRecipients})
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Dismiss Incident Modal */}
      <Modal
        isOpen={!!dismissModalIncidentId}
        onClose={closeDismissModal}
        size="md"
        title="Dismiss Incident"
        description="Mandatory justification required to dismiss emergency incident."
      >
        <div className="space-y-4 pt-2">
          <Textarea
            label="Dismissal Reason"
            placeholder="Explain why this incident is being dismissed (e.g. False alarm confirmed by local security, accidental trigger)..."
            required
            showCount
            maxLength={500}
            value={dismissReason}
            onChange={(e) => setDismissReason(e.target.value)}
          />

          <ModalFooter>
            <Button
              variant="outline"
              onClick={closeDismissModal}
              disabled={dismissMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!dismissReason.trim() || dismissMutation.isPending}
              isLoading={dismissMutation.isPending}
              onClick={handleConfirmDismissal}
            >
              Confirm Dismissal
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
