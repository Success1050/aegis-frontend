"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 4500;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const success = React.useCallback(
    (message: string, title?: string) => addToast({ type: "success", message, title }),
    [addToast]
  );

  const error = React.useCallback(
    (message: string, title?: string) => addToast({ type: "error", message, title, duration: 6000 }),
    [addToast]
  );

  const warning = React.useCallback(
    (message: string, title?: string) => addToast({ type: "warning", message, title, duration: 5000 }),
    [addToast]
  );

  const info = React.useCallback(
    (message: string, title?: string) => addToast({ type: "info", message, title }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2"
          >
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: () => void;
}) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900",
    error: "border-red-200 dark:border-red-800 bg-white dark:bg-slate-900",
    warning: "border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900",
    info: "border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900",
  };

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-right-4 duration-200",
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm">
        {toast.title && (
          <h5 className="font-semibold text-slate-900 dark:text-slate-100">
            {toast.title}
          </h5>
        )}
        <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
