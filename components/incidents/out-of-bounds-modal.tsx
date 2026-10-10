"use client";

import * as React from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Compass, AlertTriangle } from "lucide-react";

interface OutOfBoundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  latitude: number | "";
  longitude: number | "";
  warningMessage?: string;
  isPossiblySwapped?: boolean;
  onSwapCoordinates?: () => void;
}

export function OutOfBoundsModal({
  isOpen,
  onClose,
  onConfirm,
  latitude,
  longitude,
  warningMessage,
  isPossiblySwapped,
  onSwapCoordinates,
}: OutOfBoundsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Compass className="w-5 h-5 shrink-0" />
          <span>Geographic Boundary Warning</span>
        </div>
      }
      description="Location outside standard Nigerian boundary box"
    >
      <div className="space-y-4 pt-2 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Out of Nigeria Bounds</span>
          </div>
          <p className="leading-relaxed">
            {warningMessage ||
              `The provided coordinates (${latitude}, ${longitude}) lie outside the recognized geographical boundary of Nigeria.`}
          </p>
        </div>

        {isPossiblySwapped && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 space-y-2">
            <p className="font-semibold">
              Latitude and Longitude appear to be inverted.
            </p>
            {onSwapCoordinates && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onSwapCoordinates();
                  onClose();
                }}
                className="text-xs bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
              >
                Invert Coordinates (Swap Lat/Lng)
              </Button>
            )}
          </div>
        )}

        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          If you are operating near a border community or testing in a sandbox environment, you may confirm and proceed.
        </p>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Back to Edit Coordinates
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            onClick={onConfirm}
          >
            I Confirm This Location
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
