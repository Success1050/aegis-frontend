import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";

export interface RealtimeIncidentEvent {
  id: string;
  incidentId: string;
  incidentNumber: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  eventType: "CREATED" | "VERIFIED" | "ALERTING" | "SENT" | "DISMISSED" | "RESOLVED";
  timestamp: string;
}

interface RealtimeState {
  status: ConnectionStatus;
  lastPing: number | null;
  audioAlertsEnabled: boolean;
  unacknowledgedAlertsCount: number;
  recentEvents: RealtimeIncidentEvent[];

  // Actions
  setStatus: (status: ConnectionStatus) => void;
  recordPing: () => void;
  setAudioAlertsEnabled: (enabled: boolean) => void;
  toggleAudioAlerts: () => void;
  addEvent: (event: RealtimeIncidentEvent) => void;
  clearUnacknowledged: () => void;
}

export const useRealtimeStore = create<RealtimeState>()(
  persist(
    (set, get) => ({
      status: "DISCONNECTED",
      lastPing: null,
      audioAlertsEnabled: true,
      unacknowledgedAlertsCount: 0,
      recentEvents: [],

      setStatus: (status) => set({ status }),

      recordPing: () => set({ lastPing: Date.now() }),

      setAudioAlertsEnabled: (audioAlertsEnabled) => set({ audioAlertsEnabled }),

      toggleAudioAlerts: () =>
        set((state) => ({ audioAlertsEnabled: !state.audioAlertsEnabled })),

      addEvent: (event) =>
        set((state) => ({
          recentEvents: [event, ...state.recentEvents.slice(0, 19)],
          unacknowledgedAlertsCount:
            event.eventType === "CREATED" || event.eventType === "VERIFIED"
              ? state.unacknowledgedAlertsCount + 1
              : state.unacknowledgedAlertsCount,
        })),

      clearUnacknowledged: () => set({ unacknowledgedAlertsCount: 0 }),
    }),
    {
      name: "aegis_realtime_settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        audioAlertsEnabled: state.audioAlertsEnabled,
      }),
    }
  )
);
