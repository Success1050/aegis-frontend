"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const queryClient = useQueryClient();
  const [isOffline, setIsOffline] = React.useState(false);
  const [justReconnected, setJustReconnected] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      // Auto-retry all active queries when network resumes
      queryClient.invalidateQueries();

      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [queryClient]);

  if (!isOffline && !justReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 p-3.5 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold transition-all animate-in slide-in-from-bottom ${
        isOffline
          ? "bg-red-600 text-white shadow-red-950/40"
          : "bg-emerald-600 text-white shadow-emerald-950/40"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
          <span>
            Network connection lost. Changes will be queued and auto-synced upon reconnection.
          </span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Connection restored. Live tactical data refreshed.</span>
        </>
      )}
    </div>
  );
}
