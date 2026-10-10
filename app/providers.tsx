"use client";

import * as React from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/context/auth-context";
import { OfflineBanner } from "@/components/feedback/offline-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
          <OfflineBanner />
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
