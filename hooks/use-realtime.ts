"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { wsManager } from "@/lib/websocket";
import { useRealtimeStore } from "@/stores/realtime-store";
import { audioChime } from "@/lib/audio-chime";
import { incidentKeys } from "./queries/use-incidents";
import { alertKeys } from "./queries/use-alerts";
import { useToast } from "@/components/ui/toast";

export function useRealtime() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    status,
    setStatus,
    recordPing,
    audioAlertsEnabled,
    toggleAudioAlerts,
    addEvent,
  } = useRealtimeStore();

  React.useEffect(() => {
    const socket = wsManager.connect();

    setStatus("CONNECTING");

    socket.on("connect", () => {
      setStatus("CONNECTED");
      recordPing();
    });

    socket.on("disconnect", () => {
      setStatus("DISCONNECTED");
    });

    socket.on("connect_error", () => {
      setStatus("ERROR");
    });

    socket.on("pong", () => {
      recordPing();
    });

    // Handle new incident event
    socket.on("incident:created", (data: { incidentId: string; incidentNumber: string; title: string; severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }) => {
      // Invalidate queries so the list updates instantly
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });

      // Trigger audio cue if enabled
      if (useRealtimeStore.getState().audioAlertsEnabled) {
        audioChime.playEmergencyChime();
      }

      // Add to store
      addEvent({
        id: Math.random().toString(),
        incidentId: data.incidentId,
        incidentNumber: data.incidentNumber,
        title: data.title,
        severity: data.severity,
        status: "PENDING_REVIEW",
        eventType: "CREATED",
        timestamp: new Date().toISOString(),
      });

      // Show toast
      toast.warning(
        `New incident ${data.incidentNumber}: ${data.title}`,
        "PENDING REVIEW"
      );
    });

    // Handle status changes (verification, dismissal, resolution)
    socket.on("incident:updated", (data: { incidentId: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(data.incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    });

    // Handle alert fanout progress
    socket.on("alert:progress", (data: { incidentId: string }) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.byIncident(data.incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(data.incidentId) });
    });

    return () => {
      // Keep socket open or disconnect when unmounted depending on app lifecycle
    };
  }, [queryClient, setStatus, recordPing, addEvent, toast]);

  return {
    status,
    isConnected: status === "CONNECTED",
    audioAlertsEnabled,
    toggleAudioAlerts,
  };
}
