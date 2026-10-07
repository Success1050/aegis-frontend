import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className={cn(
              "h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-400 cursor-pointer",
              className
            )}
            {...props}
          />
        </div>
        <div className="text-sm">
          {label && (
            <label
              htmlFor={inputId}
              className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
