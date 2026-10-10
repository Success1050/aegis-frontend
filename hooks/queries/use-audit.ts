import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AuditLogItem {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditQueryFilters {
  entityType?: string;
  action?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const auditKeys = {
  all: ["audit"] as const,
  list: (filters: AuditQueryFilters) => [...auditKeys.all, filters] as const,
};

export function useAuditLogsQuery(filters: AuditQueryFilters = {}) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.action) params.action = filters.action;
      if (filters.actorId) params.actorId = filters.actorId;
      if (filters.limit) params.limit = filters.limit;
      if (filters.offset !== undefined) params.offset = filters.offset;

      return api.get<AuditLogsResponse>("/audit", { params });
    },
    staleTime: 10 * 1000,
  });
}
