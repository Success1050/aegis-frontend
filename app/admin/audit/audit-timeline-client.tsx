"use client";

import * as React from "react";
import { useAuditLogsQuery, type AuditLogItem } from "@/hooks/queries/use-audit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import {
  FileSpreadsheet,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  ArrowRight,
  Code2,
  Filter,
} from "lucide-react";

export function AuditTimelineClient() {
  const [entityType, setEntityType] = React.useState<string>("");
  const [actionFilter, setActionFilter] = React.useState<string>("");
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null);

  const { data: auditResult, isLoading } = useAuditLogsQuery({
    entityType: entityType || undefined,
    action: actionFilter || undefined,
    limit: 50,
  });

  const logs = auditResult?.data || [];
  const total = auditResult?.meta?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            <span>Append-Only Security Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tamper-evident chronological log of incident verifications, dismissals, retries, and credential changes.
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          Total Recorded Events: {total}
        </span>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Select
              label="Entity Type"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              options={[
                { value: "", label: "All Entities (Incidents, Users, Zones)" },
                { value: "INCIDENT", label: "Incidents" },
                { value: "USER", label: "Users" },
                { value: "ZONE", label: "Zones" },
                { value: "ALERT", label: "Alerts" },
              ]}
            />

            <Select
              label="Action Type"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              options={[
                { value: "", label: "All Actions" },
                { value: "INCIDENT_VERIFIED", label: "INCIDENT_VERIFIED" },
                { value: "INCIDENT_DISMISSED", label: "INCIDENT_DISMISSED" },
                { value: "INCIDENT_CREATED", label: "INCIDENT_CREATED" },
                { value: "INCIDENT_RESOLVED", label: "INCIDENT_RESOLVED" },
                { value: "ALERTS_RETRIED", label: "ALERTS_RETRIED" },
                { value: "USER_CREATED", label: "USER_CREATED" },
                { value: "USER_DEACTIVATED", label: "USER_DEACTIVATED" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Timeline List */}
      <div className="space-y-3">
        {isLoading ? (
          <LoadingState title="Loading chronological audit trail..." />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No audit logs found matching the selected filters.
          </div>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="hover:border-slate-400 transition-colors">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {log.entityType}: {log.entityId.slice(0, 8)}...
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Actor: {log.actorId ? `Officer ${log.actorId.slice(0, 8)}` : "SYSTEM"} • IP: {log.ip || "127.0.0.1"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    <FormattedWAT date={log.createdAt} />
                  </span>

                  {Boolean(log.before || log.after) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLog(log)}
                      className="text-[11px] h-7 px-2 gap-1 text-slate-600 dark:text-slate-300"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      Inspect Diff
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* JSON Diff Inspector Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        size="lg"
        title="Audit State Change Diff Inspector"
        description={`Action: ${selectedLog?.action} on ${selectedLog?.entityType}:${selectedLog?.entityId}`}
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="font-bold text-red-500 uppercase text-[11px]">
                State Before Change
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] max-h-60 overflow-auto border border-slate-800">
                {selectedLog?.before ? JSON.stringify(selectedLog.before, null, 2) : "null (New entity created)"}
              </pre>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-emerald-500 uppercase text-[11px]">
                State After Change
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] max-h-60 overflow-auto border border-slate-800">
                {selectedLog?.after ? JSON.stringify(selectedLog.after, null, 2) : "null"}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}>
              Close Inspector
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
