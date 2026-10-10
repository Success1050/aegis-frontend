import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Zone } from "@/types";

export const zoneKeys = {
  all: ["zones"] as const,
  lists: () => [...zoneKeys.all, "list"] as const,
  detail: (id: string) => [...zoneKeys.all, "detail", id] as const,
};

export function useZonesQuery() {
  return useQuery({
    queryKey: zoneKeys.lists(),
    queryFn: async () => {
      return api.get<Zone[]>("/zones");
    },
    staleTime: 60 * 1000, // Zones change infrequently
  });
}

export function useZoneDetailQuery(id: string) {
  return useQuery({
    queryKey: zoneKeys.detail(id),
    queryFn: async () => {
      return api.get<Zone>(`/zones/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateZoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      centerLat: number;
      centerLng: number;
      radiusMeters: number;
    }) => {
      return api.post<Zone>("/zones", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
    },
  });
}

export function useUpdateZoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      description?: string;
      centerLat?: number;
      centerLng?: number;
      radiusMeters?: number;
      isActive?: boolean;
    }) => {
      return api.patch<Zone>(`/zones/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
    },
  });
}
