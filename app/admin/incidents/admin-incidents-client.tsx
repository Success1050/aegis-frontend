"use client";

import * as React from "react";
import Link from "next/link";
import { useIncidentsQuery } from "@/hooks/queries/use-incidents";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { LoadingState } from "@/components/ui/loading-state";
import { getThreatPresentation } from "@/lib/incident-threat";
import {
  Radio,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  MapPin,
} from "lucide-react";

export function AdminIncidentsClient() {
  const { data: incidentPage, isLoading } = useIncidentsQuery({
    limit: 50,
  });

  const incidents = incidentPage?.data || [];
  const total = incidentPage?.total || incidents.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-600" />
            <span>Incident Governance & Dispatch Records</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global administrative supervision of all recorded incidents and alert fanouts.
          </p>
        </div>

        <Link href="/incidents/new">
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5">
            <PlusCircle className="w-4 h-4" />
            Report New Incident
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8">
            <LoadingState title="Loading incident records..." />
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No incidents recorded in the system yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Incident Number</th>
                  <th className="p-3">Threat Category</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Community Ward</th>
                  <th className="p-3">Reported WAT</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {incidents.map((inc) => {
                  const threat = getThreatPresentation(inc.type || inc.incidentType, inc.severity);
                  const incidentNum = inc.incidentNumber || inc.number || "INCIDENT";
                  const dateVal = inc.reportedAt || inc.createdAt;
                  const wardVal = inc.zoneName || inc.zone?.name || "Immediate Monitored Ward";

                  return (
                    <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {incidentNum}
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-[11px] uppercase text-red-600 dark:text-red-400">
                          {threat.categoryTag}
                        </span>
                      </td>
                      <td className="p-3">
                        <SeverityBadge severity={inc.severity} size="sm" />
                      </td>
                      <td className="p-3">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                        {wardVal}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        <FormattedWAT date={dateVal} />
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/incidents/${inc.id}`}>
                          <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 gap-1">
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
