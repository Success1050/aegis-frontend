"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useRealtimeStore } from "@/stores/realtime-store";
import { Activity } from "lucide-react";

export function ConnectionIndicator({ className }: { className?: string }) {
  const status = useRealtimeStore((s) => s.status);

  const config = {
    CONNECTED: {
      color: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      label: "Live Sync",
      ping: true,
    },
    CONNECTING: {
      color: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      label: "Connecting...",
      ping: false,
    },
    DISCONNECTED: {
      color: "bg-slate-400",
      textColor: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-900",
      border: "border-slate-200 dark:border-slate-800",
      label: "Offline (Polling)",
      ping: false,
    },
    ERROR: {
      color: "bg-rose-500",
      textColor: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      label: "Reconnecting",
      ping: false,
    },
  }[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border select-none transition-colors",
        config.bg,
        config.border,
        config.textColor,
        className
      )}
      title={`Realtime Status: ${status}`}
    >
      <span className="relative flex h-2 w-2">
        {config.ping && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", config.color)} />
      </span>
      <span>{config.label}</span>
    </div>
  );
}
