"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateIncidentMutation } from "@/hooks/queries/use-incidents";
import { useToast } from "@/components/ui/toast";
import { LocationPicker } from "@/components/incidents/location-picker";
import { DuplicateIncidentGuardModal } from "@/components/incidents/duplicate-guard-modal";
import { OutOfBoundsModal } from "@/components/incidents/out-of-bounds-modal";
import { validateCoordinatesClient } from "@/lib/coordinate-validator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SeverityBadge } from "@/components/ui/badge";
import type { IncidentType, IncidentSeverity } from "@/types";
import {
  ShieldAlert,
  Flame,
  Radio,
  CloudRain,
  Skull,
  UserX,
  Truck,
  Wind,
  Shield,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";

interface ThreatOption {
  type: IncidentType;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultSeverity: IncidentSeverity;
}

const THREAT_OPTIONS: ThreatOption[] = [
  {
    type: "BANDIT_ATTACK",
    label: "Armed Bandit Attack",
    category: "BANDIT RAID",
    icon: Skull,
    defaultSeverity: "CRITICAL",
  },
  {
    type: "TERRORIST_INCURSION",
    label: "Terrorist Infiltration",
    category: "TERRORIST INCURSION",
    icon: ShieldAlert,
    defaultSeverity: "CRITICAL",
  },
  {
    type: "KIDNAPPING_THREAT",
    label: "Kidnapping / Abduction",
    category: "KIDNAPPING ALERT",
    icon: UserX,
    defaultSeverity: "CRITICAL",
  },
  {
    type: "POSSIBLE_INTRUSION",
    label: "Perimeter Intrusion",
    category: "SECURITY BREACH",
    icon: Shield,
    defaultSeverity: "HIGH",
  },
  {
    type: "SUSPICIOUS_PERSON",
    label: "Suspicious Scout / Person",
    category: "SURVEILLANCE",
    icon: UserX,
    defaultSeverity: "MEDIUM",
  },
  {
    type: "SUSPICIOUS_VEHICLE",
    label: "Suspicious Convoy / Vehicle",
    category: "HOSTILE CONVOY",
    icon: Truck,
    defaultSeverity: "MEDIUM",
  },
  {
    type: "FIRE",
    label: "Fire Outbreak",
    category: "FIRE HAZARD",
    icon: Flame,
    defaultSeverity: "HIGH",
  },
  {
    type: "FLOOD_WARNING",
    label: "Flash Flood / Dam Discharge",
    category: "FLOOD EMERGENCY",
    icon: CloudRain,
    defaultSeverity: "CRITICAL",
  },
  {
    type: "SEVERE_WEATHER",
    label: "Severe Storm / Wind Hazard",
    category: "SEVERE WEATHER",
    icon: Wind,
    defaultSeverity: "MEDIUM",
  },
  {
    type: "OTHER",
    label: "Other Security Event",
    category: "INCIDENT",
    icon: Radio,
    defaultSeverity: "LOW",
  },
];

export function IncidentReportForm() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthStore();
  const createMutation = useCreateIncidentMutation();

  // Form State
  const [selectedType, setSelectedType] = React.useState<IncidentType>("BANDIT_ATTACK");
  const [severity, setSeverity] = React.useState<IncidentSeverity>("CRITICAL");
  const [description, setDescription] = React.useState("");
  const [latitude, setLatitude] = React.useState<number | "">("");
  const [longitude, setLongitude] = React.useState<number | "">("");
  const [zoneId, setZoneId] = React.useState<string>("");
  const [radiusMeters, setRadiusMeters] = React.useState<number>(2000);

  // Modals & Safety Guards
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = React.useState(false);
  const [duplicateMessage, setDuplicateMessage] = React.useState<string>("");
  const [isOutOfBoundsModalOpen, setIsOutOfBoundsModalOpen] = React.useState(false);
  const [acknowledgedOutOfBounds, setAcknowledgedOutOfBounds] = React.useState(false);

  // Submitting Guard
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handle Threat Type Selection
  const handleSelectType = (option: ThreatOption) => {
    setSelectedType(option.type);
    setSeverity(option.defaultSeverity);
  };

  const handleLocationChange = (
    lat: number | "",
    lng: number | "",
    selectedZoneId?: string
  ) => {
    setLatitude(lat);
    setLongitude(lng);
    if (selectedZoneId !== undefined) {
      setZoneId(selectedZoneId);
    }
    setAcknowledgedOutOfBounds(false);
  };

  const handleSwapCoordinates = () => {
    if (latitude !== "" && longitude !== "") {
      setLatitude(longitude);
      setLongitude(latitude);
    }
  };

  const handleSubmit = async (
    e?: React.FormEvent,
    forceDuplicateAck: boolean = false
  ) => {
    if (e) e.preventDefault();

    if (!description.trim() || description.trim().length < 10) {
      toast.error("Description must be at least 10 characters long.", "Validation Error");
      return;
    }

    if (latitude === "" || longitude === "") {
      toast.error("Please specify incident latitude and longitude coordinates.", "Location Missing");
      return;
    }

    const validation = validateCoordinatesClient(latitude, longitude);
    if (!validation.isValid) {
      toast.error(validation.errorMessage || "Invalid coordinates.", "Location Error");
      return;
    }

    // If outside Nigeria and not yet confirmed by the officer, display warning modal
    if (!validation.isWithinNigeria && !acknowledgedOutOfBounds) {
      setIsOutOfBoundsModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique idempotency token for this report attempt
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `inc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const payload = {
        type: selectedType,
        severity,
        description: description.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        zoneId: (zoneId && zoneId.trim() !== "" && zoneId !== "manual" && zoneId !== "null") ? zoneId.trim() : undefined,
        alertRadiusMeters: radiusMeters,
        acknowledgeDuplicates: forceDuplicateAck,
      };

      const result = await createMutation.mutateAsync({
        ...payload,
        idempotencyKey,
      });

      toast.success(
        `Incident ${result.incidentNumber || result.number} registered. Status: PENDING_REVIEW.`,
        "Incident Logged"
      );

      // Redirect to incident details page or tactical dashboard
      router.push(`/incidents/${result.id}`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { statusCode?: number; message?: string } }; message?: string };
      const status = errorObj?.response?.data?.statusCode;
      const message = errorObj?.response?.data?.message || errorObj.message || "Failed to create incident.";

      if (status === 409 || message.toLowerCase().includes("duplicate")) {
        setDuplicateMessage(message);
        setIsDuplicateModalOpen(true);
      } else {
        toast.error(message, "Submission Failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <span>Emergency Incident Report</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enters system in <strong>PENDING_REVIEW</strong> status. Alerts will only broadcast after Two-Officer Verification.
          </p>
        </div>

        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Officer: {user?.fullName || user?.phone || "Authenticated Officer"}
        </span>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Step 1: Specific Threat Type Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Identify Threat Category (High Urgency)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {THREAT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedType === opt.type;

                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleSelectType(opt)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? "border-red-600 bg-red-950/30 ring-2 ring-red-600/50 shadow-md"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500 dark:text-red-400 block">
                        {opt.category}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {opt.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Severity Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Severity Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as IncidentSeverity[]).map((lvl) => {
                const isSelected = severity === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? lvl === "CRITICAL"
                          ? "border-red-600 bg-red-950/40 ring-2 ring-red-500 font-black text-red-100"
                          : lvl === "HIGH"
                          ? "border-orange-500 bg-orange-950/30 ring-2 ring-orange-500 font-bold text-orange-200"
                          : lvl === "MEDIUM"
                          ? "border-amber-500 bg-amber-950/30 ring-2 ring-amber-500 font-bold text-amber-200"
                          : "border-blue-500 bg-blue-950/30 ring-2 ring-blue-500 font-bold text-blue-200"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <SeverityBadge severity={lvl} size="sm" />
                    <p className="text-[11px] mt-2 font-medium">
                      {lvl === "CRITICAL"
                        ? "Immediate Life Threat"
                        : lvl === "HIGH"
                        ? "Severe Threat / Engagement"
                        : lvl === "MEDIUM"
                        ? "Elevated Suspicion"
                        : "Advisory / Precautionary"}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Incident Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Field Situation Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <Textarea
              label="Detailed Incident Report"
              placeholder="Provide exact details of the situation (e.g. Armed bandits on 8 motorcycles approaching northern forestry path towards Kujama market. Gunshots heard. Residents retreating indoors)..."
              required
              rows={4}
              maxLength={1000}
              showCount
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Minimum 10 characters. Plain, unambiguous description of the threat."
            />
          </CardContent>
        </Card>

        {/* Step 4: Incident Location Picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              <span>Incident Geolocation & Blast Zone</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              zoneId={zoneId}
              radiusMeters={radiusMeters}
              onLocationChange={handleLocationChange}
              onRadiusChange={setRadiusMeters}
            />

            {/* Radius Override */}
            <div className="pt-2">
              <Input
                label="Alert Blast Radius (Meters)"
                type="number"
                min={100}
                max={25000}
                step={100}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                helperText="Subscribers within this radius or anchored to this zone will be notified. Default: 2,000m."
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Submitting registers this incident. A <strong>second officer</strong> must verify before alerts dispatch.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-md shadow-red-950"
              isLoading={isSubmitting}
            >
              <span>Submit for Verification</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </form>

      {/* Duplicate Incident Warning Modal */}
      <DuplicateIncidentGuardModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        duplicateDetails={{
          message: duplicateMessage,
        }}
        isLoading={isSubmitting}
        onConfirm={() => {
          setIsDuplicateModalOpen(false);
          handleSubmit(undefined, true);
        }}
      />

      {/* Out of Nigeria Boundary Soft Warning Modal */}
      <OutOfBoundsModal
        isOpen={isOutOfBoundsModalOpen}
        onClose={() => setIsOutOfBoundsModalOpen(false)}
        latitude={latitude}
        longitude={longitude}
        isPossiblySwapped={
          validateCoordinatesClient(
            latitude === "" ? null : latitude,
            longitude === "" ? null : longitude
          ).isPossiblySwapped
        }
        onSwapCoordinates={handleSwapCoordinates}
        onConfirm={() => {
          setAcknowledgedOutOfBounds(true);
          setIsOutOfBoundsModalOpen(false);
          // Re-trigger submit with acknowledged out-of-bounds
          setTimeout(() => handleSubmit(undefined, false), 50);
        }}
      />
    </div>
  );
}
