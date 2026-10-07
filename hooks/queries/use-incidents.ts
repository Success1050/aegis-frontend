import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  RecipientPreviewResult,
  PaginatedResult,
} from "@/types";

export interface IncidentsFilterParams {
  status?: IncidentStatus | "ALL";
  severity?: IncidentSeverity | "ALL";
  page?: number;
  limit?: number;
  zoneId?: string;
  search?: string;
}

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters: IncidentsFilterParams) => [...incidentKeys.lists(), filters] as const,
  details: () => [...incidentKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
  previews: () => [...incidentKeys.all, "preview"] as const,
  preview: (id: string) => [...incidentKeys.previews(), id] as const,
  alerts: (id: string) => [...incidentKeys.detail(id), "alerts"] as const,
};

/**
 * Fetch incident list with filters and pagination
 */
export function useIncidentsQuery(filters: IncidentsFilterParams = {}) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.status && filters.status !== "ALL") params.status = filters.status;
      if (filters.severity && filters.severity !== "ALL") params.severity = filters.severity;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.zoneId) params.zoneId = filters.zoneId;

      return api.get<PaginatedResult<Incident>>("/incidents", { params });
    },
    // Poll every 10 seconds if on emergency tab
    refetchInterval: 10 * 1000,
  });
}

/**
 * Fetch single incident detail by ID
 */
export function useIncidentDetailQuery(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: async () => {
      return api.get<Incident>(`/incidents/${id}`);
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Auto-poll faster (every 3 seconds) while incident is in ALERTING state
      const status = query.state.data?.status;
      return status === "ALERTING" || status === "VERIFIED" ? 3000 : 10000;
    },
  });
}

/**
 * Fetch recipient preview dry-run (Two-Officer Verification check)
 */
export function useRecipientPreviewQuery(incidentId: string, enabled = true) {
  return useQuery({
    queryKey: incidentKeys.preview(incidentId),
    queryFn: async () => {
      return api.get<RecipientPreviewResult>(`/incidents/${incidentId}/preview-recipients`);
    },
    enabled: !!incidentId && enabled,
    staleTime: 5 * 1000, // Preview is sensitive to subscriber updates
  });
}

/**
 * Create a new emergency incident
 */
export function useCreateIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      incidentType: IncidentType;
      severity: IncidentSeverity;
      latitude: number;
      longitude: number;
      zoneId?: string;
      blastRadiusMeters?: number;
    }) => {
      return api.post<Incident>("/incidents", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
}

/**
 * Verify incident and trigger SMS fanout blast
 */
export function useVerifyIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      blastRadiusMeters,
    }: {
      incidentId: string;
      blastRadiusMeters?: number;
    }) => {
      return api.post<Incident>(`/incidents/${incidentId}/verify`, {
        blastRadiusMeters,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(variables.incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.alerts(variables.incidentId) });
    },
  });
}

/**
 * Dismiss incident with required reason
 */
export function useDismissIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      dismissReason,
    }: {
      incidentId: string;
      dismissReason: string;
    }) => {
      return api.post<Incident>(`/incidents/${incidentId}/dismiss`, {
        dismissReason,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(variables.incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

/**
 * Resolve incident with optional All-Clear broadcast
 */
export function useResolveIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      resolveNotes,
      sendAllClear,
    }: {
      incidentId: string;
      resolveNotes?: string;
      sendAllClear?: boolean;
    }) => {
      return api.post<Incident>(`/incidents/${incidentId}/resolve`, {
        resolveNotes,
        sendAllClear,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(variables.incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}
