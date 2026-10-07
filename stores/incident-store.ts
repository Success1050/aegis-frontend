import { create } from "zustand";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/types";

interface IncidentFilters {
  status?: IncidentStatus | "ALL";
  severity?: IncidentSeverity | "ALL";
  search?: string;
  zoneId?: string;
}

interface IncidentState {
  selectedIncident: Incident | null;
  filters: IncidentFilters;
  verificationModalIncidentId: string | null;
  dismissModalIncidentId: string | null;
  resolveModalIncidentId: string | null;

  // Actions
  setSelectedIncident: (incident: Incident | null) => void;
  setFilters: (filters: Partial<IncidentFilters>) => void;
  resetFilters: () => void;
  openVerificationModal: (incidentId: string) => void;
  closeVerificationModal: () => void;
  openDismissModal: (incidentId: string) => void;
  closeDismissModal: () => void;
  openResolveModal: (incidentId: string) => void;
  closeResolveModal: () => void;
}

const defaultFilters: IncidentFilters = {
  status: "ALL",
  severity: "ALL",
  search: "",
};

export const useIncidentStore = create<IncidentState>((set) => ({
  selectedIncident: null,
  filters: defaultFilters,
  verificationModalIncidentId: null,
  dismissModalIncidentId: null,
  resolveModalIncidentId: null,

  setSelectedIncident: (selectedIncident) => set({ selectedIncident }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  openVerificationModal: (verificationModalIncidentId) =>
    set({ verificationModalIncidentId }),
  closeVerificationModal: () => set({ verificationModalIncidentId: null }),

  openDismissModal: (dismissModalIncidentId) =>
    set({ dismissModalIncidentId }),
  closeDismissModal: () => set({ dismissModalIncidentId: null }),

  openResolveModal: (resolveModalIncidentId) =>
    set({ resolveModalIncidentId }),
  closeResolveModal: () => set({ resolveModalIncidentId: null }),
}));
