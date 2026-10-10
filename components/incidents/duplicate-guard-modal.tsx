"use client";

import * as React from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface DuplicateIncidentGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  duplicateDetails?: {
    message?: string;
    existingNumber?: string;
    distanceMeters?: number;
  };
  isLoading?: boolean;
}

export function DuplicateIncidentGuardModal({
  isOpen,
  onClose,
  onConfirm,
  duplicateDetails,
  isLoading = false,
}: DuplicateIncidentGuardModalProps) {
  const [acknowledged, setAcknowledged] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAcknowledged(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
          <span>Possible Duplicate Incident Detected</span>
        </div>
      }
      description="Safety guard against duplicate emergency panic and SMS waste"
    >
      <div className="space-y-4 pt-2 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Active Incident in Immediate Vicinity</span>
          </div>
          <p className="leading-relaxed">
            {duplicateDetails?.message ||
              "An active incident was reported within 500 meters of these coordinates in the last 30 minutes."}
          </p>
          {duplicateDetails?.existingNumber && (
            <p className="font-mono font-bold text-amber-800 dark:text-amber-300">
              Reference Incident: {duplicateDetails.existingNumber}
              {duplicateDetails.distanceMeters && ` (~${Math.round(duplicateDetails.distanceMeters)}m away)`}
            </p>
          )}
        </div>

        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Broadcasting multiple alerts for the same underlying incident can trigger severe community confusion, panic, and unnecessary SMS expenses.
        </p>

        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <Checkbox
            label="I confirm this is a separate, distinct emergency event"
            description="I have verified that this is not a duplicate report of the existing nearby incident."
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel Report
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            disabled={!acknowledged || isLoading}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Acknowledge & Submit Anyway
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
