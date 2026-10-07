"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  Flame,
  Radio,
  Users,
  Activity,
  ArrowRight,
  CheckCircle,
  Bell,
  Lock,
  Globe2,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  SeverityBadge,
  StatusBadge,
  RoleBadge,
  useToast,
} from "@/components/ui";

export default function Home() {
  const toast = useToast();

  const handleTestToast = () => {
    toast.success("Design system tokens and toast notifications are active!", "System Ready");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                AEGIS
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded dark:bg-emerald-950/60 dark:text-emerald-300">
                EARLY-WARNING
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            </Link>
            <Button size="sm" onClick={handleTestToast}>
              <Bell className="w-4 h-4 mr-1.5" />
              Test Toast
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Phase 1: Automated Community Early-Warning System
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Rapid Threat Detection & Multilingual Broadcast for Nigerian Communities
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Aegis bridges incident verification and mass telecom fanout in seconds. Powered by dual-pillar recipient resolution (GPS geofencing and community zone membership).
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Access Security Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/portal">
              <Button size="lg" variant="outline" className="gap-2">
                <Globe2 className="w-4 h-4" />
                Resident Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Design System & Visual Tokens Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                Incident Severities
              </CardTitle>
              <CardDescription>
                Color tokens compliant with WCAG AA contrast
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <SeverityBadge severity="CRITICAL" />
              <SeverityBadge severity="HIGH" />
              <SeverityBadge severity="MEDIUM" />
              <SeverityBadge severity="LOW" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Lifecycle Statuses
              </CardTitle>
              <CardDescription>
                Two-officer state machine indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <StatusBadge status="PENDING_REVIEW" />
              <StatusBadge status="VERIFIED" />
              <StatusBadge status="ALERTING" />
              <StatusBadge status="ALERTS_SENT" />
              <StatusBadge status="RESOLVED" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Role Identities
              </CardTitle>
              <CardDescription>
                Hierarchical role-based access tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <RoleBadge role="ADMIN" />
              <RoleBadge role="SECURITY" />
              <RoleBadge role="RESIDENT" />
            </CardContent>
          </Card>
        </div>

        {/* Architecture & Guarantees Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm dark:bg-red-950/60 dark:text-red-300">
              4EYES
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Four-Eyes Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Self-verification is blocked by default. Two distinct officers must inspect and authorize every blast.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm dark:bg-emerald-950/60 dark:text-emerald-300">
              DUAL
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Dual-Pillar Targeting
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Notifies users physically within geofence radius PLUS all registered zone residents, even when away.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm dark:bg-blue-950/60 dark:text-blue-300">
              5LANG
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Multilingual SMS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dynamic template generation in Hausa, Yoruba, Igbo, Nigerian Pidgin, and English with strict zero-coordinate leakage.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm dark:bg-purple-950/60 dark:text-purple-300">
              IDEMP
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Idempotency Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every critical action uses cryptographic idempotency keys to eliminate double-clicks and network retries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Aegis Early-Warning Network. Built for Nigerian Community Safety.</p>
          <div className="flex items-center gap-4">
            <span>NDPR Privacy Compliant</span>
            <span>•</span>
            <span>West Africa Time (WAT)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
