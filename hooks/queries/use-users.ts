import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserProfile, UserRole, Language, PaginatedResult } from "@/types";

export interface UsersFilterParams {
  role?: UserRole | "ALL";
  language?: Language | "ALL";
  zoneId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UsersFilterParams) => [...userKeys.lists(), filters] as const,
  me: () => [...userKeys.all, "me"] as const,
};

export function useUsersQuery(filters: UsersFilterParams = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.role && filters.role !== "ALL") params.role = filters.role;
      if (filters.language && filters.language !== "ALL") params.language = filters.language;
      if (filters.zoneId) params.zoneId = filters.zoneId;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      return api.get<PaginatedResult<UserProfile>>("/users", { params });
    },
    staleTime: 15 * 1000,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      phone: string;
      email?: string;
      fullName?: string;
      role: UserRole;
      preferredLanguage: Language;
      alertsEnabled?: boolean;
      latitude?: number;
      longitude?: number;
      zoneId?: string;
      houseNumber?: string;
      areaDescription?: string;
      password?: string;
    }) => {
      return api.post<UserProfile>("/users", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUserPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      preferredLanguage?: Language;
      alertsEnabled?: boolean;
    }) => {
      return api.patch<UserProfile>("/users/preferences", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      fullName?: string;
      role?: UserRole;
      preferredLanguage?: Language;
      alertsEnabled?: boolean;
      latitude?: number | null;
      longitude?: number | null;
      zoneId?: string | null;
      houseNumber?: string;
      areaDescription?: string;
      isActive?: boolean;
    }) => {
      return api.patch<UserProfile>(`/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export interface BulkImportRowOutcome {
  row: number;
  phone: string;
  success: boolean;
  userId?: string;
  error?: string;
}

export interface BulkImportResponse {
  totalSubmitted: number;
  successful: number;
  failed: number;
  results: BulkImportRowOutcome[];
}

export function useBulkImportUsersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      users: Array<{
        phone: string;
        fullName?: string;
        email?: string;
        role?: UserRole;
        preferredLanguage?: Language;
        alertsEnabled?: boolean;
        zoneId?: string;
        houseNumber?: string;
        areaDescription?: string;
        latitude?: number;
        longitude?: number;
      }>;
      defaultZoneId?: string;
      dispatchCredentials?: boolean;
    }) => {
      return api.post<BulkImportResponse>("/users/bulk-import", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
