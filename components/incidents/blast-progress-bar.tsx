import * as React from "react";
import { cn } from "@/lib/utils";

export interface BlastCounts {
  queued: number;
  sending: number;
  sent: number;
  delivered: number;
  failed: number;
  total: number;
}

export function BlastProgressBar({
  counts,
  className,
}: {
  counts: BlastCounts;
  className?: string;
}) {
  const { total, queued, sending, sent, delivered, failed } = counts;

  if (total === 0) {
    return (
      <div className={cn("w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden", className)}>
        <div className="bg-slate-300 dark:bg-slate-700 h-full w-full" />
      </div>
    );
  }

  const deliveredPct = (delivered / total) * 100;
  const sentPct = (sent / total) * 100;
  const sendingPct = (sending / total) * 100;
  const queuedPct = (queued / total) * 100;
  const failedPct = (failed / total) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex shadow-inner">
        {deliveredPct > 0 && (
          <div
            style={{ width: `${deliveredPct}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title={`Delivered: ${delivered}`}
          />
        )}
        {sentPct > 0 && (
          <div
            style={{ width: `${sentPct}%` }}
            className="bg-teal-400 h-full transition-all duration-300"
            title={`Sent: ${sent}`}
          />
        )}
        {sendingPct > 0 && (
          <div
            style={{ width: `${sendingPct}%` }}
            className="bg-purple-500 h-full transition-all duration-300 animate-pulse"
            title={`Sending: ${sending}`}
          />
        )}
        {queuedPct > 0 && (
          <div
            style={{ width: `${queuedPct}%` }}
            className="bg-amber-400 h-full transition-all duration-300"
            title={`Queued: ${queued}`}
          />
        )}
        {failedPct > 0 && (
          <div
            style={{ width: `${failedPct}%` }}
            className="bg-rose-500 h-full transition-all duration-300"
            title={`Failed: ${failed}`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Delivered: {delivered}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
          <span>Sent: {sent}</span>
        </div>
        {sending > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>Sending: {sending}</span>
          </div>
        )}
        {queued > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Queued: {queued}</span>
          </div>
        )}
        {failed > 0 && (
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Failed: {failed}</span>
          </div>
        )}
        <div className="text-slate-400 dark:text-slate-500">
          Total: {total}
        </div>
      </div>
    </div>
  );
}
