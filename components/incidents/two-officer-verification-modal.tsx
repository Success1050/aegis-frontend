"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRecipientPreviewQuery, useVerifyIncidentMutation } from "@/hooks/queries/use-incidents";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import type { Incident } from "@/types";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  MapPin,
  Radio,
  Clock,
  Languages,
  DollarSign,
  AlertCircle,
  Lock,
} from "lucide-react";

interface TwoOfficerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
  onSuccess?: () => void;
}

export function TwoOfficerVerificationModal({
  isOpen,
  onClose,
  incident,
  onSuccess,
}: TwoOfficerVerificationModalProps) {
  const toast = useToast();
  const { user } = useAuthStore();
  const verifyMutation = useVerifyIncidentMutation();

  const { data: preview, isLoading: previewLoading } = useRecipientPreviewQuery(
    incident.id,
    isOpen
  );

  const [overrideSelfVerify, setOverrideSelfVerify] = React.useState(false);
  const [largeBlastConfirmed, setLargeBlastConfirmed] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"recipients" | "languages" | "samples">("recipients");

  // Check Four-Eyes violation
  const isReporter = user?.id === incident.reportedById;
  const isAdmin = user?.role === "ADMIN";
  const isFourEyesBlocked = isReporter && !isAdmin;

  const totalRecipients = preview?.totalRecipients ?? 0;
  const physicalCount =
    preview?.breakdown?.byPhysicalRadius ?? preview?.physicallyNearbyCount ?? 0;
  const zoneCount =
    preview?.breakdown?.byZoneMembership ?? preview?.communityMemberCount ?? 0;
  const overlapCount =
    preview?.breakdown?.overlapCount ?? preview?.overlapCount ?? 0;
  const langBreakdown =
    preview?.breakdown?.byLanguage ?? preview?.languageBreakdown ?? {};
  const samples = preview?.sampleRecipients || [];

  const roleDict = (preview?.breakdown?.byRole || {}) as Record<string, number>;
  const residentCount =
    roleDict["RESIDENT"] ??
    roleDict["resident"] ??
    preview?.roleBreakdown?.residents ??
    totalRecipients;

  const securityCount =
    roleDict["SECURITY"] ??
    roleDict["security"] ??
    preview?.roleBreakdown?.security ??
    0;

  const adminCount =
    roleDict["ADMIN"] ??
    roleDict["admin"] ??
    0;

  // Estimated SMS cost: ₦4.00 per recipient * segments
  const estimatedCost = preview?.estimatedCostNgn ?? totalRecipients * 4;
  const estimatedSegments = preview?.estimatedSegments ?? totalRecipients;

  const handleConfirmVerification = async () => {
    if (isFourEyesBlocked) {
      toast.error(
        "Four-Eyes Principle violation: The reporting officer cannot verify their own incident.",
        "Verification Prohibited"
      );
      return;
    }

    if (preview?.requiresLargeBlastConfirmation && !largeBlastConfirmed) {
      toast.warning("Please confirm the large recipient blast warning before sending.", "Notice");
      return;
    }

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `vfy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await verifyMutation.mutateAsync({
        incidentId: incident.id,
        confirmLargeBlast: largeBlastConfirmed,
        overrideSelfVerify,
        blastRadiusMeters: incident.alertRadiusMeters || incident.blastRadiusMeters,
        idempotencyKey,
      });

      toast.success(
        `Incident ${incident.incidentNumber || incident.number} verified! Real-time SMS dispatch enqueued.`,
        "Alert Blast Triggered"
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message || errorObj.message || "Failed to verify incident.";
      toast.error(message, "Verification Failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>Two-Officer Verification & Alert Blast Dry-Run</span>
        </div>
      }
      description={`Incident ${incident.incidentNumber || incident.number} • Strict Four-Eyes Validation`}
    >
      {previewLoading || !preview ? (
        <LoadingState title="Calculating dual-pillar recipient geofence..." />
      ) : (
        <div className="space-y-4 pt-1 text-xs">
          {/* Four-Eyes Principle Guard Banner */}
          {isReporter && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                isFourEyesBlocked
                  ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              }`}
            >
              {isFourEyesBlocked ? (
                <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {isFourEyesBlocked
                    ? "FOUR-EYES VERIFICATION ENFORCEMENT"
                    : "ADMINISTRATOR SELF-VERIFICATION OVERRIDE"}
                </p>
                <p className="leading-relaxed">
                  {isFourEyesBlocked
                    ? "You reported this incident. Under the Four-Eyes Security Principle, a distinct second officer must review and verify this alert before community SMS broadcast can be triggered."
                    : "You reported this incident as an Administrator. You may proceed using an emergency override, but a second officer verification is recommended."}
                </p>
                {isAdmin && (
                  <div className="pt-2">
                    <Checkbox
                      label="Override Four-Eyes Policy (Admin Emergency Override)"
                      checked={overrideSelfVerify}
                      onChange={(e) => setOverrideSelfVerify(e.target.checked)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dual-Pillar Target Counters */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">
                Total Blast Target
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {totalRecipients}
              </p>
              <span className="text-[10px] text-slate-400">Deduplicated</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                Physical GPS Nearby
              </span>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5">
                {physicalCount}
              </p>
              <span className="text-[10px] text-blue-500/80">Within blast radius</span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold uppercase">
                Zone Members
              </span>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                {zoneCount}
              </p>
              <span className="text-[10px] text-purple-500/80">Anchored residents</span>
            </div>
          </div>

          {/* Tabs for Deep Preview */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("recipients")}
              className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                activeTab === "recipients"
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Audience & Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("languages")}
              className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                activeTab === "languages"
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Multilingual Distribution
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("samples")}
              className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                activeTab === "samples"
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Sample Recipients ({samples.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "recipients" && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Audience Composition</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  Overlap in both pillars: <strong>{overlapCount}</strong>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 text-[10px]">Residents</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {residentCount}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 text-[10px]">Security Patrols</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {securityCount}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 text-[10px]">Duty Admins</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {adminCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "languages" && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Local Language Fanout Targets
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(langBreakdown).map(([lang, count]) => (
                  <div
                    key={lang}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-mono"
                  >
                    <span className="text-slate-500">{lang}:</span>
                    <strong className="text-slate-900 dark:text-white">{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "samples" && (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Masked Phone</th>
                    <th className="p-2">Language</th>
                    <th className="p-2">Pillar Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {samples.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="p-2 font-medium">{s.name}</td>
                      <td className="p-2 font-mono">{s.phoneMasked}</td>
                      <td className="p-2">{s.preferredLanguage}</td>
                      <td className="p-2 text-slate-500 font-mono text-[10px]">
                        {s.matchReason} {s.distanceMeters ? `(~${Math.round(s.distanceMeters)}m)` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SMS Delivery Forecast & Cost */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                SMS Segment Volume: ~{estimatedSegments} segments
              </p>
              <p className="text-emerald-700 dark:text-emerald-400">
                Forecast Cost: ₦{estimatedCost.toLocaleString()} NGN (Termii DND-Bypass Rate)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-mono font-bold text-[10px]">
              DEDICATED ROUTE
            </span>
          </div>

          {/* Large Blast Confirmation Guard */}
          {preview.requiresLargeBlastConfirmation && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Large Blast Audience Safety Guard</span>
              </div>
              <p className="text-amber-700 dark:text-amber-300 leading-relaxed text-[11px]">
                This emergency alert exceeds the standard community threshold. Please explicitly confirm you intend to broadcast to all {totalRecipients} subscribers.
              </p>
              <Checkbox
                label="I confirm emergency broadcast to this large audience"
                checked={largeBlastConfirmed}
                onChange={(e) => setLargeBlastConfirmed(e.target.checked)}
              />
            </div>
          )}

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={verifyMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 shadow-lg shadow-red-950"
              disabled={
                isFourEyesBlocked ||
                (isReporter && !overrideSelfVerify) ||
                (preview.requiresLargeBlastConfirmation && !largeBlastConfirmed) ||
                verifyMutation.isPending
              }
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmVerification}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Confirm & Dispatch ({totalRecipients} Recipients)</span>
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}
