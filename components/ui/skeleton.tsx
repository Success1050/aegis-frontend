import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

export function IncidentRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 p-6 space-y-4 dark:border-slate-800">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
