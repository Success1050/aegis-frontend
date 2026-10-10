"use client";

import * as React from "react";
import { useResolveIncidentMutation } from "@/hooks/queries/use-incidents";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface ResolveIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  incidentNumber?: string;
  onSuccess?: () => void;
}

export function ResolveIncidentModal({
  isOpen,
  onClose,
  incidentId,
  incidentNumber,
  onSuccess,
}: ResolveIncidentModalProps) {
  const toast = useToast();
  const resolveMutation = useResolveIncidentMutation();
  const [resolveNotes, setResolveNotes] = React.useState("");
  const [sendAllClear, setSendAllClear] = React.useState(true);

  const handleConfirmResolve = async () => {
    try {
      await resolveMutation.mutateAsync({
        incidentId,
        resolveNotes: resolveNotes.trim() || undefined,
        sendAllClear,
      });

      toast.success(
        `Incident ${incidentNumber || ""} has been resolved.${sendAllClear ? " All-clear alert broadcasted to community." : ""}`,
        "Incident Resolved"
      );

      setResolveNotes("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message || errorObj.message || "Failed to resolve incident.";
      toast.error(message, "Resolution Failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Resolve Emergency Incident</span>
        </div>
      }
      description={`Incident ${incidentNumber || ""} • Mark threat neutralized or all-clear`}
    >
      <div className="space-y-4 pt-2 text-xs">
        <Textarea
          label="Resolution Summary / Debrief Notes"
          placeholder="Briefly state how the incident was resolved (e.g. Security patrol cleared area; threat neutralized; residents advised to resume normal activity)..."
          rows={3}
          maxLength={500}
          showCount
          value={resolveNotes}
          onChange={(e) => setResolveNotes(e.target.value)}
          helperText="Optional but recommended for tactical records."
        />

        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <Checkbox
            label="Broadcast All-Clear SMS notice to community residents"
            description="Sends an affirmative All-Clear advisory in their preferred language so residents know it is safe to emerge."
            checked={sendAllClear}
            onChange={(e) => setSendAllClear(e.target.checked)}
          />
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={resolveMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            isLoading={resolveMutation.isPending}
            onClick={handleConfirmResolve}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Confirm Resolution
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
