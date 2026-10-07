"use client";

import * as React from "react";
import { useIncidentStore } from "@/stores/incident-store";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useZonesQuery } from "@/hooks/queries/use-zones";
import { Search, RotateCcw, Filter } from "lucide-react";
import type { IncidentSeverity, IncidentStatus } from "@/types";

export function IncidentFiltersBar({ className }: { className?: string }) {
  const { filters, setFilters, resetFilters } = useIncidentStore();
  const { data: zones } = useZonesQuery();

  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.severity !== "ALL" ||
    !!filters.search ||
    !!filters.zoneId;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Search Input */}
      <div className="flex-1 min-w-[220px]">
        <Input
          placeholder="Search by ID, title, keyword..."
          leftIcon={<Search className="w-4 h-4" />}
          value={filters.search || ""}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>

      {/* Status Filter */}
      <div className="w-[160px]">
        <Select
          value={filters.status || "ALL"}
          onChange={(e) => setFilters({ status: e.target.value as IncidentStatus | "ALL" })}
          options={[
            { value: "ALL", label: "All Statuses" },
            { value: "PENDING_REVIEW", label: "Pending Review" },
            { value: "VERIFIED", label: "Verified" },
            { value: "ALERTING", label: "Alerting" },
            { value: "ALERTS_SENT", label: "Alerts Sent" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "DISMISSED", label: "Dismissed" },
          ]}
        />
      </div>

      {/* Severity Filter */}
      <div className="w-[140px]">
        <Select
          value={filters.severity || "ALL"}
          onChange={(e) => setFilters({ severity: e.target.value as IncidentSeverity | "ALL" })}
          options={[
            { value: "ALL", label: "All Severities" },
            { value: "CRITICAL", label: "Critical" },
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
          ]}
        />
      </div>

      {/* Community Zone Filter */}
      {zones && zones.length > 0 && (
        <div className="w-[180px]">
          <Select
            value={filters.zoneId || ""}
            onChange={(e) => setFilters({ zoneId: e.target.value || undefined })}
            options={[
              { value: "", label: "All Communities" },
              ...zones.map((z) => ({ value: z.id, label: z.name })),
            ]}
          />
        </div>
      )}

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
