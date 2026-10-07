"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useRealtimeStore } from "@/stores/realtime-store";
import { audioChime } from "@/lib/audio-chime";
import { Volume2, VolumeX } from "lucide-react";

export function AudioChimeToggle({ className }: { className?: string }) {
  const { audioAlertsEnabled, toggleAudioAlerts } = useRealtimeStore();

  const handleToggle = () => {
    toggleAudioAlerts();
    // If enabling, test chime so officer confirms audio works
    if (!audioAlertsEnabled) {
      setTimeout(() => {
        audioChime.playConfirmationChime();
      }, 50);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer select-none",
        audioAlertsEnabled
          ? "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
          : "bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 line-through opacity-75 hover:opacity-100",
        className
      )}
      title={audioAlertsEnabled ? "Audible alert chimes enabled" : "Audible alert chimes muted"}
    >
      {audioAlertsEnabled ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Audio Cue On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          <span>Audio Cue Muted</span>
        </>
      )}
    </button>
  );
}
