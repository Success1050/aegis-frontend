"use client";

import * as React from "react";
import { useAlertsQuery, useRetryFailedAlertsMutation } from "@/hooks/queries/use-alerts";
import { Button } from "@/components/ui/button";
import { Badge, AlertStatusBadge } from "@/components/ui/badge";
import { MaskedPhone } from "@/components/ui/masked-phone";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { AlertStatus } from "@/types";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  Filter,
  Radio,
  AlertTriangle,
} from "lucide-react";

interface AlertDeliveryTrackerProps {
  incidentId: string;
}

export function AlertDeliveryTracker({ incidentId }: AlertDeliveryTrackerProps) {
  const toast = useToast();
  const [selectedStatus, setSelectedStatus] = React.useState<AlertStatus | "ALL">("ALL");
  const [page, setPage] = React.useState(1);
  const [isRetryModalOpen, setIsRetryModalOpen] = React.useState(false);

  const filterStatus = selectedStatus === "ALL" ? undefined : selectedStatus;
  const { data: alertsResult, isLoading, refetch } = useAlertsQuery(incidentId, {
    status: filterStatus,
    page,
    limit: 20,
  });

  const retryMutation = useRetryFailedAlertsMutation(incidentId);

  const alerts = alertsResult?.data || [];
  const totalAlerts = alertsResult?.total || 0;
  const totalPages = alertsResult?.totalPages || 1;

  // Aggregate status counts
  const deliveredCount = alerts.filter((a) => a.status === "DELIVERED").length;
  const sentCount = alerts.filter((a) => a.status === "SENT").length;
  const sendingCount = alerts.filter((a) => a.status === "SENDING").length;
  const queuedCount = alerts.filter((a) => a.status === "QUEUED").length;
  const failedCount = alerts.filter((a) => a.status === "FAILED").length;

  const totalTracked = alerts.length || 1;
  const deliveredPct = Math.round((deliveredCount / totalTracked) * 100);
  const sentPct = Math.round((sentCount / totalTracked) * 100);
  const failedPct = Math.round((failedCount / totalTracked) * 100);

  const handleConfirmRetry = async () => {
    try {
      const res = await retryMutation.mutateAsync();
      toast.success(
        `Re-enqueued ${res.reEnqueuedCount || "failed"} alerts for re-dispatch.`,
        "Retry Triggered"
      );
      setIsRetryModalOpen(false);
      refetch();
    } catch {
      toast.error("Failed to retry alerts.", "Error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Blast Segmented Progress Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Alert Fanout Delivery
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Targets: {totalAlerts}
            </span>
            {failedCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRetryModalOpen(true)}
                className="text-xs text-red-500 border-red-500/50 hover:bg-red-500/10 h-7 gap-1 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                Retry Failed ({failedCount})
              </Button>
            )}
          </div>
        </div>

        {/* Multi-state segmented progress bar */}
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${deliveredPct}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Delivered: ${deliveredCount}`}
          />
          <div
            style={{ width: `${sentPct}%` }}
            className="h-full bg-blue-500 transition-all duration-500"
            title={`Sent / Provider: ${sentCount}`}
          />
          <div
            style={{ width: `${failedPct}%` }}
            className="h-full bg-red-500 transition-all duration-500"
            title={`Failed: ${failedCount}`}
          />
        </div>

        {/* Status Legend Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs pt-1">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Queued</span>
            <p className="font-extrabold text-amber-500">{queuedCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Sending</span>
            <p className="font-extrabold text-blue-400">{sendingCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Sent</span>
            <p className="font-extrabold text-blue-500">{sentCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Delivered</span>
            <p className="font-extrabold text-emerald-500">{deliveredCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Failed</span>
            <p className="font-extrabold text-red-500">{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(["ALL", "DELIVERED", "SENT", "QUEUED", "FAILED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setSelectedStatus(st);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === st
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-400">
          Auto-polling every 4s
        </span>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
        {isLoading ? (
          <div className="p-6">
            <LoadingState title="Loading alert logs..." />
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No alert records found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Recipient Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Segments</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">Delivered / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-semibold">
                      <MaskedPhone phone={alert.recipientPhone} />
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {alert.recipientRole}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{alert.language}</td>
                    <td className="p-3">
                      <AlertStatusBadge status={alert.status} />
                    </td>
                    <td className="p-3 font-mono">{alert.segmentCount}</td>
                    <td className="p-3 font-mono">{alert.attemptCount}</td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {alert.deliveredAt ? (
                        <FormattedWAT date={alert.deliveredAt} />
                      ) : alert.sentAt ? (
                        <FormattedWAT date={alert.sentAt} />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-slate-500 font-mono">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Retry Failed Alerts Confirmation Modal */}
      <Modal
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        size="md"
        title="Retry Failed Alerts"
        description="Re-queue failed SMS messages for dispatch"
      >
        <div className="space-y-4 pt-2 text-xs">
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            Are you sure you want to re-enqueue all failed alert records for this incident? The system will attempt re-delivery through the secondary carrier route.
          </p>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setIsRetryModalOpen(false)}
              disabled={retryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              isLoading={retryMutation.isPending}
              onClick={handleConfirmRetry}
            >
              Retry {failedCount} Failed Alerts
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
