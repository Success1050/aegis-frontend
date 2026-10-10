"use client";

import * as React from "react";
import Link from "next/link";
import { useIncidentsQuery } from "@/hooks/queries/use-incidents";
import { useZonesQuery } from "@/hooks/queries/use-zones";
import { useUsersQuery } from "@/hooks/queries/use-users";
import {
  useAdminDashboardQuery,
  useCircuitBreakerQuery,
  useResetCircuitBreakerMutation,
  useQueueStatsQuery,
  usePauseQueueMutation,
  useResumeQueueMutation,
} from "@/hooks/queries/use-dashboard";
import { SystemStatusBanner } from "@/components/dashboard/system-status-banner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import {
  ShieldAlert,
  Users,
  MapPin,
  Radio,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Pause,
  Play,
  RotateCcw,
  Languages,
  CheckCheck,
  XCircle,
  Clock,
} from "lucide-react";

export function AdminDashboardClient() {
  const toast = useToast();
  const { data: adminStats, isLoading: adminStatsLoading } = useAdminDashboardQuery();
  const { data: incidentPage, isLoading: incidentsLoading } = useIncidentsQuery();
  const { data: zones, isLoading: zonesLoading } = useZonesQuery();
  const { data: userPage, isLoading: usersLoading } = useUsersQuery();
  const { data: circuit } = useCircuitBreakerQuery();
  const { data: queue } = useQueueStatsQuery();

  const resetCircuitMutation = useResetCircuitBreakerMutation();
  const pauseQueueMutation = usePauseQueueMutation();
  const resumeQueueMutation = useResumeQueueMutation();

  const incidents = incidentPage?.data || [];
  const totalIncidents = adminStats?.incidentsByStatus
    ? Object.values(adminStats.incidentsByStatus).reduce((a, b) => a + b, 0)
    : incidentPage?.total || incidents.length;
  const totalUsers = adminStats?.totalUsers ?? userPage?.total ?? 0;
  const totalZones = adminStats?.totalZones ?? zones?.length ?? 0;

  const usersByRole = adminStats?.usersByRole || { admin: 0, security: 0, resident: 0 };
  const usersByLanguage = adminStats?.usersByLanguage || {};
  const alertStats = adminStats?.alertStats || {
    total: 0,
    queued: 0,
    sending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
  };

  const handleResetCircuitBreaker = async () => {
    try {
      await resetCircuitMutation.mutateAsync();
      toast.success("Circuit breaker manually reset to CLOSED.", "Gateway Reset");
    } catch {
      toast.error("Failed to reset circuit breaker.", "Error");
    }
  };

  const handleToggleQueue = async (pause: boolean) => {
    try {
      if (pause) {
        await pauseQueueMutation.mutateAsync();
        toast.warning("Alert dispatch queue has been PAUSED.", "Emergency Pause");
      } else {
        await resumeQueueMutation.mutateAsync();
        toast.success("Alert dispatch queue has RESUMED.", "Queue Resumed");
      }
    } catch {
      toast.error("Failed to change queue status.", "Error");
    }
  };

  const isCircuitBroken = circuit?.state === "OPEN" || circuit?.state === "HALF_OPEN";
  const isQueuePaused = queue?.paused === true || adminStats?.systemStatus?.queuePaused === true;

  return (
    <div className="space-y-8">
      {/* System Warning Banner for Paused Queues, Tripped Circuit Breakers, or Translations */}
      <SystemStatusBanner />

      {/* Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System Governance & Network Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global supervision of incidents, carrier health, and community safety nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isQueuePaused ? (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              isLoading={resumeQueueMutation.isPending}
              onClick={() => handleToggleQueue(false)}
            >
              <Play className="w-3.5 h-3.5" />
              Resume Alert Queue
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10 text-xs gap-1.5"
              isLoading={pauseQueueMutation.isPending}
              onClick={() => handleToggleQueue(true)}
            >
              <Pause className="w-3.5 h-3.5" />
              Emergency Pause Queue
            </Button>
          )}
        </div>
      </div>

      {/* Global Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>COMMUNITY ZONES</span>
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold">{totalZones}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Active geofence areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>TOTAL SUBSCRIBERS</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {usersByRole.resident} residents • {usersByRole.security} officers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>TOTAL INCIDENTS</span>
              <Radio className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold">{totalIncidents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">All recorded security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>TOTAL SMS SENT</span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold">{alertStats.sent + alertStats.delivered}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {alertStats.delivered} delivered • {alertStats.failed} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Language & Role Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Breakdown by Role */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Subscribers by System Role
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 uppercase font-bold">Residents</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {usersByRole.resident}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-[11px] text-blue-600 dark:text-blue-400 uppercase font-bold">Security</span>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
                  {usersByRole.security}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="text-[11px] text-purple-600 dark:text-purple-400 uppercase font-bold">Admins</span>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                  {usersByRole.admin}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residents Language Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-purple-600" />
                Community Language Preferences
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.keys(usersByLanguage).length === 0 ? (
                <p className="text-xs text-slate-400">Loading language distribution...</p>
              ) : (
                Object.entries(usersByLanguage).map(([lang, count]) => (
                  <div
                    key={lang}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{lang}:</span>
                    <span className="font-extrabold text-purple-600 dark:text-purple-400">{count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure & Carrier Health Card */}
      <Card className={`border-l-4 ${isCircuitBroken ? "border-l-red-500" : "border-l-emerald-500"}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Carrier Gateway & SMS Delivery Infrastructure
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isCircuitBroken
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {circuit?.state || "CLOSED"}
              </span>

              {isCircuitBroken && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-red-500/50 hover:bg-red-500/10 text-red-500 gap-1 h-7 px-2"
                  isLoading={resetCircuitMutation.isPending}
                  onClick={handleResetCircuitBreaker}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Breaker
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500">Primary Aggregator</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Termii (Nigerian DND Auto-Bypass)
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500">Gateway Requests</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {circuit?.totalRequests ?? 0} total ({circuit?.failures ?? 0} failed)
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500">Alert Queue Status</span>
            <p className={`font-semibold ${isQueuePaused ? "text-amber-500 font-bold" : "text-emerald-600 dark:text-emerald-400"}`}>
              {isQueuePaused ? "PAUSED (Held)" : "RUNNING (Dispatching)"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500">Queue Backlog</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {queue?.waiting ?? 0} waiting • {queue?.active ?? 0} in-flight
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Governance Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              Register residents by Zone + House number or device GPS. Dispatches initial login credentials automatically.
            </p>
            <Link href="/admin/users" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Manage Users
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              Community Zones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              Define protected community boundaries, geofence radius, and default officer dispatch zones.
            </p>
            <Link href="/admin/zones" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Manage Zones
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-500" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              Tamper-evident chronological history of incident verifications, dismissals, retries, and logins.
            </p>
            <Link href="/admin/audit" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Inspect Audit Timeline
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
