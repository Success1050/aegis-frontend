"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { ConnectionIndicator, AudioChimeToggle } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/badge";
import { useRealtime } from "@/hooks/use-realtime";
import {
  Shield,
  PlusCircle,
  Radio,
  FileText,
  LogOut,
  Bell,
  Home,
  Menu,
  X,
} from "lucide-react";

export function OfficerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Initialize realtime listener & audio cue hooks
  useRealtime();

  const navItems = [
    { href: "/dashboard", label: "Command Feed", icon: Radio },
    { href: "/incidents/new", label: "Report Incident", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* High-Stress Tactical Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/50">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    AEGIS
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 rounded">
                    SECURITY DISPATCH
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {user?.zoneName || "National Geofence Zone"}
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center ml-4">
              <ConnectionIndicator />
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "primary" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-xs",
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <AudioChimeToggle />
            </div>

            <Link href="/incidents/new" className="hidden sm:inline-flex">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-950"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                REPORT INCIDENT
              </Button>
            </Link>

            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-200">
                  {user?.name || user?.fullName || "Duty Officer"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {user?.phone || user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Log Out"
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <ConnectionIndicator />
              <AudioChimeToggle />
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <item.icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <Link href="/incidents/new" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  REPORT INCIDENT
                </Button>
              </Link>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>{user?.name || user?.phone}</span>
              <button onClick={logout} className="text-red-400 hover:underline">
                Log Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Tactical Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
