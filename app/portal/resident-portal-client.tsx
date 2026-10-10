"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useIncidentsQuery } from "@/hooks/queries/use-incidents";
import { useResidentDashboardQuery } from "@/hooks/queries/use-dashboard";
import { useUpdateUserPreferencesMutation } from "@/hooks/queries/use-users";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { FormattedWAT } from "@/components/ui/formatted-time";
import { useToast } from "@/components/ui/toast";
import {
  ShieldCheck,
  ShieldAlert,
  Bell,
  Globe,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  CloudRain,
  Shield,
  Zap,
  PhoneCall,
  Siren,
  LifeBuoy,
} from "lucide-react";
import type { Language } from "@/types";
import { getThreatPresentation } from "@/lib/incident-threat";

export function ResidentPortalClient() {
  const toast = useToast();
  const { user, setUser } = useAuthStore();
  const { data: residentStats } = useResidentDashboardQuery();
  const { data: incidentPage } = useIncidentsQuery({
    limit: 10,
  });

  const updatePrefMutation = useUpdateUserPreferencesMutation();

  const [alertsEnabled, setAlertsEnabled] = React.useState(
    user?.alertsEnabled ?? true
  );
  const [preferredLang, setPreferredLang] = React.useState<Language>(
    user?.preferredLanguage || "ENGLISH"
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [showOptOutModal, setShowOptOutModal] = React.useState(false);

  // Sync state if user loads from store or server
  React.useEffect(() => {
    if (user) {
      setAlertsEnabled(user.alertsEnabled);
      if (user.preferredLanguage) {
        setPreferredLang(user.preferredLanguage);
      }
    }
  }, [user]);

  // Filter active broadcasted incidents for community residents
  const activeAlerts = (incidentPage?.data || []).filter(
    (i) => i.status === "ALERTING" || i.status === "ALERTS_SENT"
  );

  const isCommunitySecure = activeAlerts.length === 0;

  const handleToggleAlerts = (checked: boolean) => {
    if (!checked) {
      // If resident wants to turn off emergency SMS, show opt-out warning modal
      setShowOptOutModal(true);
    } else {
      setAlertsEnabled(true);
    }
  };

  const handleConfirmOptOut = () => {
    setAlertsEnabled(false);
    setShowOptOutModal(false);
  };

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
            ? `No active threats reported in ${user?.zoneName || residentStats?.zoneName || "your community zone"}. Routine patrols and monitoring active.`
            : "Officers have verified an emergency safety threat in your vicinity. Review directives below."}
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
                {user?.zoneName || residentStats?.zoneName || "Assigned Community Zone"}
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
          activeAlerts.map((alert) => {
            const threat = getThreatPresentation(alert.type || alert.incidentType, alert.severity);
            const timeVal = alert.createdAt || alert.reportedAt;
            const areaVal = alert.zoneName || alert.zone?.name || user?.zoneName || "Immediate Monitored Ward";
            const incidentSeq = alert.number || alert.incidentNumber;

            return (
              <Card
                key={alert.id}
                className={
                  alert.severity === "CRITICAL"
                    ? "border-2 border-red-600 bg-red-950/25 shadow-lg shadow-red-950/40"
                    : alert.severity === "HIGH"
                    ? "border-2 border-orange-500 bg-orange-950/20"
                    : "border border-amber-500/60 bg-amber-950/15"
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={alert.severity} size="sm" />
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-red-900/60 text-red-200 border border-red-700/80">
                        {threat.categoryTag}
                      </span>
                      {incidentSeq && (
                        <span className="font-mono text-[11px] text-slate-400 font-semibold">
                          {incidentSeq}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      <FormattedWAT date={timeVal} />
                    </span>
                  </div>

                  {/* High-Alert Direct Threat Headline */}
                  <h4 className="text-base sm:text-lg font-black text-red-100 tracking-tight mt-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />
                    <span>{threat.headline}</span>
                  </h4>
                </CardHeader>

                <CardContent className="space-y-3.5 pt-0 text-xs sm:text-sm">
                  {/* Confirmed Incident Situation Details */}
                  <div className="text-slate-200 leading-relaxed bg-black/40 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs uppercase font-bold block mb-1">
                      Field Situation Report:
                    </span>
                    <p>{alert.description}</p>
                  </div>

                  {/* Immediate Actionable Safety Directive */}
                  <div className="p-3 rounded-lg bg-red-900/40 border border-red-700/80 text-xs text-red-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-red-100 uppercase tracking-wider text-[11px]">
                        Immediate Action Directive:
                      </p>
                      <p className="mt-0.5 text-xs text-red-100 font-medium leading-relaxed">
                        {threat.directive}
                      </p>
                    </div>
                  </div>

                  {/* Clean Non-Leaking Area & Security Authorization Footer */}
                  <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Affected Ward: <strong>{areaVal}</strong></span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/80">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirmed by Security Command</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Local Emergency Hotlines Card */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-500" />
            Verified Local Emergency Hotlines
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-0">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">National Emergency Toll-Free</p>
              <p className="text-slate-500 text-[11px]">Police, Ambulance, Fire</p>
            </div>
            <a
              href="tel:112"
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs"
            >
              112
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Local Police Station (DPO)</p>
              <p className="text-slate-500 text-[11px]">Division Rapid Response</p>
            </div>
            <a
              href="tel:+2348030000112"
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-mono font-bold text-xs"
            >
              CALL
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Community Vigilante Leader</p>
              <p className="text-slate-500 text-[11px]">Ward Patrol Coordinator</p>
            </div>
            <a
              href="tel:+2348020000999"
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-mono font-bold text-xs"
            >
              CALL
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">State Emergency Agency (SEMA)</p>
              <p className="text-slate-500 text-[11px]">Disaster & Flood Relief</p>
            </div>
            <a
              href="tel:+234800000SEMA"
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-mono font-bold text-xs"
            >
              CALL
            </a>
          </div>
        </CardContent>
      </Card>

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
            onChange={(e) => handleToggleAlerts(e.target.checked)}
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

      {/* SMS Opt-Out Safety Warning Modal */}
      <Modal
        isOpen={showOptOutModal}
        onClose={() => setShowOptOutModal(false)}
        size="md"
        title={
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Disable Emergency SMS Broadcasts?</span>
          </div>
        }
        description="Crucial life-safety notification advisory"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 pt-2">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 space-y-1.5">
            <p className="font-extrabold">CAUTION: HIGH-RISK ENVIRONMENT</p>
            <p>
              By opting out of SMS alerts, you will <strong>NOT</strong> receive urgent warning broadcasts sent during armed attacks, bandit movements, kidnappings, or flash floods in your ward.
            </p>
          </div>
          <p>
            Are you completely sure you want to stop receiving immediate SMS notifications on your phone?
          </p>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowOptOutModal(false)}
            >
              Keep SMS Active (Recommended)
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmOptOut}
            >
              Yes, Disable SMS
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
