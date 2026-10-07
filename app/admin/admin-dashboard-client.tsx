"use client";

import * as React from "react";
import Link from "next/link";
import { useIncidentsQuery } from "@/hooks/queries/use-incidents";
import { useZonesQuery } from "@/hooks/queries/use-zones";
import { useUsersQuery } from "@/hooks/queries/use-users";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
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
} from "lucide-react";

export function AdminDashboardClient() {
  const { data: incidentPage, isLoading: incidentsLoading } = useIncidentsQuery();
  const { data: zones, isLoading: zonesLoading } = useZonesQuery();
  const { data: userPage, isLoading: usersLoading } = useUsersQuery();

  const incidents = incidentPage?.data || [];
  const totalIncidents = incidentPage?.total || incidents.length;
  const totalUsers = userPage?.total || 0;
  const totalZones = zones?.length || 0;

  const criticalIncidents = incidents.filter((i) => i.severity === "CRITICAL").length;
  const verifiedIncidents = incidents.filter((i) => i.status === "VERIFIED" || i.status === "ALERTS_SENT").length;

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Governance & Network Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Global supervision of incidents, carrier health, and community safety nodes.
        </p>
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
              <span>REGISTERED SUBSCRIBERS</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Residents & Officers</p>
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
            <p className="text-xs text-slate-500">
              {criticalIncidents} Critical severity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>DISPATCHED BLASTS</span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold">{verifiedIncidents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Verified & Broadcasted</p>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure & Carrier Health Card */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Carrier Gateway & SMS Delivery Infrastructure
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold dark:bg-emerald-950 dark:text-emerald-300">
              OPERATIONAL
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500">Primary Aggregator</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Termii (Nigerian DND Auto-Bypass)
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500">Circuit Breaker Status</span>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
              CLOSED (Normal Traffic Allowed)
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500">Delivery Latency</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              ~2.4 seconds average
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
