"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useIncidentsQuery } from "@/hooks/queries/use-incidents";
import { useUpdateUserPreferencesMutation } from "@/hooks/queries/use-users";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { useToast } from "@/components/ui/toast";
import { ShieldCheck, ShieldAlert, Bell, Globe, MapPin, CheckCircle2 } from "lucide-react";
import type { Language } from "@/types";

export function ResidentPortalClient() {
  const toast = useToast();
  const { user, setUser } = useAuthStore();
  const { data: incidentPage } = useIncidentsQuery({
    limit: 5,
  });

  const updatePrefMutation = useUpdateUserPreferencesMutation();

  const [alertsEnabled, setAlertsEnabled] = React.useState(
    user?.alertsEnabled ?? true
  );
  const [preferredLang, setPreferredLang] = React.useState<Language>(
    user?.preferredLanguage || "ENGLISH"
  );
  const [isSaving, setIsSaving] = React.useState(false);

  // Filter only active broadcasted incidents for community residents
  const activeAlerts = (incidentPage?.data || []).filter(
    (i) => i.status === "ALERTING" || i.status === "ALERTS_SENT"
  );

  const isCommunitySecure = activeAlerts.length === 0;

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updatePrefMutation.mutateAsync({
        alertsEnabled,
        preferredLanguage: preferredLang,
      });

      if (user) {
        setUser({
          ...user,
          alertsEnabled,
          preferredLanguage: preferredLang,
        });
      }

      toast.success("Safety preferences updated successfully.", "Settings Saved");
    } catch {
      toast.error("Failed to update preferences.", "Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Status Banner */}
      <div
        className={`p-6 rounded-2xl border text-center space-y-2 transition-colors ${
          isCommunitySecure
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
        }`}
      >
        <div className="inline-flex p-3 rounded-full bg-white dark:bg-slate-900 shadow-xs mb-1">
          {isCommunitySecure ? (
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400 animate-pulse" />
          )}
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {isCommunitySecure
            ? "Your Community is Currently SECURE"
            : "EMERGENCY SAFETY ALERT ACTIVE"}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {isCommunitySecure
            ? `No active threats reported in ${user?.zoneName || "your community zone"}. Routine patrols and monitoring active.`
            : "Officers have verified a safety threat in your vicinity. Review instructions below."}
        </p>
      </div>

      {/* Community Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            Registered Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400">Community Zone</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.zoneName || "Assigned Community Zone"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">House / Compound Number</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.houseNumber || "Compound Record"}
              </p>
            </div>
          </div>
          {user?.areaDescription && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Street / Quarter Landmark</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user.areaDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Local Safety Notices Feed (STRICT ZERO COORDINATE LEAKAGE) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          Recent Community Safety Notices
        </h3>

        {activeAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No active safety alerts for this area.
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <Card key={alert.id} className="border-red-200 dark:border-red-900/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    <FormattedWAT date={alert.reportedAt} />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  {alert.description}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Area: {alert.zone?.name || "Immediate Neighborhood"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Verified by Field Security
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            Safety Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <Checkbox
            label="Enable Emergency SMS Broadcasts"
            description="Receive critical incident warnings and all-clear notices even when away from home."
            checked={alertsEnabled}
            onChange={(e) => setAlertsEnabled(e.target.checked)}
          />

          <div className="pt-2">
            <Select
              label="Preferred Alert Language"
              helperText="Emergency messages will be delivered in your chosen language."
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value as Language)}
              options={[
                { value: "HAUSA", label: "Hausa (Harshen Hausa)" },
                { value: "PIDGIN", label: "Nigerian Pidgin (Naija)" },
                { value: "YORUBA", label: "Yorùbá (Èdè Yorùbá)" },
                { value: "IGBO", label: "Igbo (Asụsụ Igbo)" },
                { value: "ENGLISH", label: "English (Official)" },
              ]}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              onClick={handleSavePreferences}
              isLoading={isSaving}
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
