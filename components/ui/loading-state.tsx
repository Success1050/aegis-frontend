import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingState({
  title = "Loading data...",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 text-slate-500 animate-spin mb-3" />
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {description}
        </p>
      )}
      <span className="sr-only">Loading, please wait...</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-10 text-center rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800",
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-500 dark:text-slate-400">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
