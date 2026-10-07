import * as React from "react";
import { cn } from "@/lib/utils";
import type { Incident } from "@/types";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { CheckCircle2, Clock, Radio, ShieldCheck, XCircle } from "lucide-react";

export function IncidentTimeline({
  incident,
  className,
}: {
  incident: Incident;
  className?: string;
}) {
  const steps = [
    {
      id: "reported",
      label: "Reported",
      timestamp: incident.reportedAt,
      completed: true,
      officer: incident.reporter?.fullName || incident.reporter?.phone,
      icon: Clock,
    },
    {
      id: "verified",
      label: "Verified & Fanout",
      timestamp: incident.verifiedAt,
      completed: !!incident.verifiedAt,
      officer: incident.verifier?.fullName || incident.verifier?.phone,
      icon: ShieldCheck,
    },
    {
      id: "alerts",
      label: "Alerts Dispatched",
      timestamp: incident.alertsCompletedAt,
      completed: !!incident.alertsCompletedAt,
      icon: Radio,
    },
    {
      id: "resolved",
      label: incident.status === "DISMISSED" ? "Dismissed" : "Resolved",
      timestamp: incident.dismissedAt || incident.resolvedAt,
      completed: !!(incident.dismissedAt || incident.resolvedAt),
      icon: incident.status === "DISMISSED" ? XCircle : CheckCircle2,
    },
  ];

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent =
            step.completed &&
            (idx === steps.length - 1 || !steps[idx + 1].completed);

          return (
            <div key={step.id} className="flex-1 flex items-start gap-3 relative">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border transition-colors",
                  step.completed
                    ? isCurrent
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700"
                    : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    step.completed
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {step.label}
                </p>
                {step.timestamp ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <FormattedWAT date={step.timestamp} />
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-600">Pending</p>
                )}
                {step.officer && (
                  <p className="text-[11px] text-slate-500">By: {step.officer}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
