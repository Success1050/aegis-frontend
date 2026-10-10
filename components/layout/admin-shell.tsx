"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useUiStore } from "@/stores/ui-store";
import { ConnectionIndicator } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/badge";
import { useRealtime } from "@/hooks/use-realtime";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  MapPin,
  Radio,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useRealtime();

  const navLinks = [
    { href: "/admin", label: "System Overview", icon: LayoutDashboard },
    { href: "/admin/incidents", label: "Incident Governance", icon: Radio },
    { href: "/admin/users", label: "User Directory & Registration", icon: Users },
    { href: "/admin/zones", label: "Community Zones", icon: MapPin },
    { href: "/admin/audit", label: "Audit Timeline", icon: FileSpreadsheet },
    { href: "/dashboard", label: "Tactical Dispatch View", icon: Radio },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Admin Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 md:static",
          sidebarOpen ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-white shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="truncate">
                <span className="font-extrabold text-base tracking-tight">AEGIS</span>
                <span className="ml-1.5 px-1 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-800 rounded dark:bg-purple-950 dark:text-purple-300">
                  ADMIN
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          {sidebarOpen ? (
            <div className="flex items-center justify-between gap-2">
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                  {user?.name || user?.fullName || "Administrator"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || user?.phone}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Log Out"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Log Out"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <ConnectionIndicator />
          </div>

          <div className="flex items-center gap-3">
            <RoleBadge role="ADMIN" />
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs text-slate-600 hover:text-red-600 hover:border-red-300 dark:text-slate-300 dark:hover:text-red-400 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
