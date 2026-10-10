"use client";

import * as React from "react";
import { useDismissIncidentMutation } from "@/hooks/queries/use-incidents";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { XCircle, AlertTriangle } from "lucide-react";

interface DismissIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  incidentNumber?: string;
  onSuccess?: () => void;
}

export function DismissIncidentModal({
  isOpen,
  onClose,
  incidentId,
  incidentNumber,
  onSuccess,
}: DismissIncidentModalProps) {
  const toast = useToast();
  const dismissMutation = useDismissIncidentMutation();
  const [reason, setReason] = React.useState("");

  const handleConfirmDismiss = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error("Dismissal reason must be at least 5 characters.", "Validation Error");
      return;
    }

    try {
      await dismissMutation.mutateAsync({
        incidentId,
        dismissReason: reason.trim(),
      });

      toast.info(
        `Incident ${incidentNumber || ""} dismissed successfully.`,
        "Incident Dismissed"
      );

      setReason("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message || errorObj.message || "Failed to dismiss incident.";
      toast.error(message, "Dismissal Failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <XCircle className="w-5 h-5 text-red-500" />
          <span>Dismiss Emergency Incident</span>
        </div>
      }
      description={`Incident ${incidentNumber || ""} • Permanent dismissal`}
    >
      <div className="space-y-4 pt-2 text-xs">
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Dismissing permanently closes this incident report without broadcasting SMS alerts. A mandatory justification is required for the permanent audit trail.
          </p>
        </div>

        <Textarea
          label="Justification for Dismissal"
          placeholder="State the confirmed operational justification (e.g. False alarm verified with local vigilante leader; test submission; accidental duplicate)..."
          required
          rows={3}
          maxLength={500}
          showCount
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          helperText="Minimum 5 characters. Stored in tamper-evident audit logs."
        />

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={dismissMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim() || reason.trim().length < 5 || dismissMutation.isPending}
            isLoading={dismissMutation.isPending}
            onClick={handleConfirmDismiss}
          >
            Confirm Permanent Dismissal
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
