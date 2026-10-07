import * as React from "react";
import { cn } from "@/lib/utils";
import type { IncidentSeverity, IncidentStatus, AlertStatus, UserRole } from "@/types";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  ShieldCheck,
  Radio,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Flame,
  ShieldAlert,
  User,
  Shield,
  UserCheck,
} from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning" | "destructive" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const variantStyles = {
    default: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    outline: "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    warning: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    destructive: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    info: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Specialized Severity Badge with appropriate icons and accessible high-contrast colors
 */
export function SeverityBadge({
  severity,
  size = "md",
  showIcon = true,
  className,
}: {
  severity: IncidentSeverity;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  switch (severity) {
    case "CRITICAL":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-red-100 text-red-800 border border-red-300 font-semibold dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 shadow-xs",
            className
          )}
        >
          {showIcon && <Flame className={cn(iconSize, "text-red-600 dark:text-red-400 shrink-0")} />}
          CRITICAL
        </Badge>
      );
    case "HIGH":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-orange-100 text-orange-800 border border-orange-300 font-semibold dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800",
            className
          )}
        >
          {showIcon && <AlertTriangle className={cn(iconSize, "text-orange-600 dark:text-orange-400 shrink-0")} />}
          HIGH
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800",
            className
          )}
        >
          {showIcon && <AlertCircle className={cn(iconSize, "text-amber-600 dark:text-amber-400 shrink-0")} />}
          MEDIUM
        </Badge>
      );
    case "LOW":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800",
            className
          )}
        >
          {showIcon && <Info className={cn(iconSize, "text-blue-600 dark:text-blue-400 shrink-0")} />}
          LOW
        </Badge>
      );
    default:
      return <Badge size={size}>{severity}</Badge>;
  }
}

/**
 * Specialized Status Badge with lifecycle-specific iconography
 */
export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: {
  status: IncidentStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  switch (status) {
    case "PENDING_REVIEW":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold dark:bg-yellow-950/80 dark:text-yellow-200 dark:border-yellow-700 animate-pulse",
            className
          )}
        >
          {showIcon && <Clock className={cn(iconSize, "text-yellow-700 dark:text-yellow-400 shrink-0")} />}
          Pending Review
        </Badge>
      );
    case "VERIFIED":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-700",
            className
          )}
        >
          {showIcon && <ShieldCheck className={cn(iconSize, "text-indigo-600 dark:text-indigo-400 shrink-0")} />}
          Verified
        </Badge>
      );
    case "ALERTING":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-700 animate-pulse",
            className
          )}
        >
          {showIcon && <Radio className={cn(iconSize, "text-purple-600 dark:text-purple-400 shrink-0")} />}
          Alerting
        </Badge>
      );
    case "ALERTS_SENT":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700",
            className
          )}
        >
          {showIcon && <CheckCircle2 className={cn(iconSize, "text-emerald-600 dark:text-emerald-400 shrink-0")} />}
          Alerts Sent
        </Badge>
      );
    case "ALERTS_PARTIALLY_FAILED":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700",
            className
          )}
        >
          {showIcon && <AlertCircle className={cn(iconSize, "text-rose-600 dark:text-rose-400 shrink-0")} />}
          Partial Failures
        </Badge>
      );
    case "DISMISSED":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
            className
          )}
        >
          {showIcon && <XCircle className={cn(iconSize, "text-slate-500 dark:text-slate-400 shrink-0")} />}
          Dismissed
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge
          size={size}
          className={cn(
            "bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
            className
          )}
        >
          {showIcon && <CheckCheck className={cn(iconSize, "text-zinc-500 dark:text-zinc-400 shrink-0")} />}
          Resolved
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
}

/**
 * Specialized Role Badge
 */
export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  switch (role) {
    case "ADMIN":
      return (
        <Badge
          className={cn(
            "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300",
            className
          )}
        >
          <ShieldAlert className="w-3 h-3 text-purple-600 dark:text-purple-400 mr-1" />
          Admin
        </Badge>
      );
    case "SECURITY":
      return (
        <Badge
          className={cn(
            "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300",
            className
          )}
        >
          <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1" />
          Security
        </Badge>
      );
    case "RESIDENT":
      return (
        <Badge
          className={cn(
            "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300",
            className
          )}
        >
          <User className="w-3 h-3 text-slate-500 mr-1" />
          Resident
        </Badge>
      );
  }
}
