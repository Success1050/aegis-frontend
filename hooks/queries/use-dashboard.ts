import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  SecurityDashboardStats,
  AdminDashboardStats,
  ResidentDashboardStats,
  CircuitBreakerMetrics,
  QueueStats,
} from "@/types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  security: () => [...dashboardKeys.all, "security"] as const,
  admin: () => [...dashboardKeys.all, "admin"] as const,
  resident: () => [...dashboardKeys.all, "resident"] as const,
  circuitBreaker: () => [...dashboardKeys.all, "circuit-breaker"] as const,
  queueStats: () => [...dashboardKeys.all, "queue-stats"] as const,
};

/**
 * Hook for Security Operations Command stats (/dashboard/security)
 * Refreshes every 10 seconds, pausing automatically when the browser tab is hidden.
 */
export function useSecurityDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.security(),
    queryFn: async () => {
      return api.get<SecurityDashboardStats>("/dashboard/security");
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for Administrator Dashboard stats (/dashboard/admin)
 * Refreshes every 10 seconds, pausing automatically when the browser tab is hidden.
 */
export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: async () => {
      return api.get<AdminDashboardStats>("/dashboard/admin");
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for Resident Safety Portal stats (/dashboard/resident)
 * Refreshes every 10 seconds, pausing automatically when the browser tab is hidden.
 */
export function useResidentDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.resident(),
    queryFn: async () => {
      return api.get<ResidentDashboardStats>("/dashboard/resident");
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for Carrier SMS Circuit Breaker status
 */
export function useCircuitBreakerQuery() {
  return useQuery({
    queryKey: dashboardKeys.circuitBreaker(),
    queryFn: async () => {
      return api.get<CircuitBreakerMetrics>("/alerts/circuit-breaker");
    },
    refetchInterval: 8000,
    refetchIntervalInBackground: false,
  });
}

/**
 * Mutation to reset SMS Circuit Breaker back to CLOSED
 */
export function useResetCircuitBreakerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.post<{ success: boolean; message: string }>(
        "/alerts/circuit-breaker/reset"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.circuitBreaker() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.admin() });
    },
  });
}

/**
 * Hook for Alert Queue stats (BullMQ / In-memory)
 */
export function useQueueStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.queueStats(),
    queryFn: async () => {
      return api.get<QueueStats>("/alerts/queue/stats");
    },
    refetchInterval: 8000,
    refetchIntervalInBackground: false,
  });
}

/**
 * Mutation to pause alert dispatch queue
 */
export function usePauseQueueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.post<{ success: boolean; message: string }>("/alerts/queue/pause");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.queueStats() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.admin() });
    },
  });
}

/**
 * Mutation to resume alert dispatch queue
 */
export function useResumeQueueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.post<{ success: boolean; message: string }>("/alerts/queue/resume");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.queueStats() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.admin() });
    },
  });
}
