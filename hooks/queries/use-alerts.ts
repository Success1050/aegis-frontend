import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AlertItem, AlertStatus, PaginatedResult } from "@/types";
import { incidentKeys } from "./use-incidents";

export const alertKeys = {
  all: ["alerts"] as const,
  byIncident: (incidentId: string, status?: AlertStatus) =>
    [...alertKeys.all, incidentId, status || "ALL"] as const,
};

/**
 * Fetch alerts dispatched for an incident
 */
export function useAlertsQuery(
  incidentId: string,
  options?: { status?: AlertStatus; page?: number; limit?: number; enabled?: boolean }
) {
  const { status, page = 1, limit = 50, enabled = true } = options || {};

  return useQuery({
    queryKey: alertKeys.byIncident(incidentId, status),
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (status) params.status = status;

      return api.get<PaginatedResult<AlertItem>>(`/incidents/${incidentId}/alerts`, {
        params,
      });
    },
    enabled: !!incidentId && enabled,
    // Poll every 4 seconds during active delivery tracking
    refetchInterval: 4000,
  });
}

/**
 * Trigger manual retry of all failed alerts for an incident
 */
export function useRetryFailedAlertsMutation(incidentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.post<{ reEnqueuedCount: number }>(
        `/incidents/${incidentId}/alerts/retry-failed`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.byIncident(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}
