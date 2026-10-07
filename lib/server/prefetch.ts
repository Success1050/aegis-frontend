import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { serverApi } from "./api";
import { incidentKeys } from "@/hooks/queries/use-incidents";
import { zoneKeys } from "@/hooks/queries/use-zones";
import type { PaginatedResult, Incident, Zone } from "@/types";

/**
 * Server prefetch helper for Officer / Admin incident dashboard
 */
export async function prefetchIncidentsData() {
  const queryClient = getQueryClient();

  // Prefetch initial incident list
  await queryClient.prefetchQuery({
    queryKey: incidentKeys.list({}),
    queryFn: async () => {
      const data = await serverApi<PaginatedResult<Incident>>("/incidents");
      return data || { data: [], total: 0, page: 1, limit: 20, totalPages: 1 };
    },
  });

  // Prefetch community zones for filters and quick actions
  await queryClient.prefetchQuery({
    queryKey: zoneKeys.lists(),
    queryFn: async () => {
      const data = await serverApi<Zone[]>("/zones");
      return data || [];
    },
  });

  return dehydrate(queryClient);
}
