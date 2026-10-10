"use client";

import * as React from "react";
import { useZonesQuery } from "@/hooks/queries/use-zones";
import { validateCoordinatesClient } from "@/lib/coordinate-validator";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Crosshair,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Compass,
} from "lucide-react";

interface LocationPickerProps {
  latitude: number | "";
  longitude: number | "";
  zoneId: string;
  radiusMeters: number;
  onLocationChange: (lat: number | "", lng: number | "", zoneId?: string) => void;
  onRadiusChange?: (radius: number) => void;
  readOnly?: boolean;
}

export function LocationPicker({
  latitude,
  longitude,
  zoneId,
  radiusMeters,
  onLocationChange,
  onRadiusChange,
  readOnly = false,
}: LocationPickerProps) {
  const { data: zones } = useZonesQuery();
  const [isLocating, setIsLocating] = React.useState(false);
  const [geoError, setGeoError] = React.useState<string | null>(null);

  const numLat = typeof latitude === "number" ? latitude : null;
  const numLng = typeof longitude === "number" ? longitude : null;
  const validation = validateCoordinatesClient(numLat, numLng);

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onLocationChange(lat, lng, zoneId);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(
          err.code === 1
            ? "Location permission was denied. Please enter coordinates manually."
            : "Failed to obtain current GPS location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleZoneSelect = (selectedZoneId: string) => {
    const zone = zones?.find((z) => z.id === selectedZoneId);
    if (zone) {
      const lat = Number(zone.centerLat);
      const lng = Number(zone.centerLng);
      onLocationChange(lat, lng, zone.id);
      if (onRadiusChange && zone.radiusMeters) {
        onRadiusChange(zone.radiusMeters);
      }
    } else {
      onLocationChange(latitude, longitude, "");
    }
  };

  const handleSwapCoordinates = () => {
    if (latitude !== "" && longitude !== "") {
      onLocationChange(longitude, latitude, zoneId);
    }
  };

  const zoneOptions = [
    { value: "", label: "Manual coordinates (or choose a zone...)" },
    ...(zones?.map((z) => ({
      value: z.id,
      label: `${z.name} (Lat: ${Number(z.centerLat).toFixed(3)}, Lng: ${Number(z.centerLng).toFixed(3)})`,
    })) || []),
  ];

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Incident Incident Geolocation
          </span>
        </div>

        {/* Validation Status Badge */}
        {latitude !== "" && longitude !== "" && (
          <div>
            {!validation.isValid ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                <AlertTriangle className="w-3 h-3" />
                Invalid Coordinates
              </span>
            ) : validation.isPossiblySwapped ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Inverted (Swapped) Coordinates
              </span>
            ) : !validation.isWithinNigeria ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <Compass className="w-3 h-3" />
                Outside Nigeria Bounds
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Verified Nigeria Coordinates
              </span>
            )}
          </div>
        )}
      </div>

      {/* Zone Center Shortcut Dropdown */}
      <div>
        <Select
          label="Community Zone Center Shortcut"
          helperText="Auto-populates coordinates with the geographic center of the selected zone."
          value={zoneId}
          onChange={(e) => handleZoneSelect(e.target.value)}
          options={zoneOptions}
          disabled={readOnly}
        />
      </div>

      {/* Manual Latitude and Longitude Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Latitude (°N)"
          type="number"
          step="any"
          placeholder="e.g. 9.896521"
          required
          value={latitude}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : parseFloat(e.target.value);
            onLocationChange(val, longitude, zoneId);
          }}
          disabled={readOnly}
          helperText="Valid Nigerian latitude: 4.0 to 14.0"
        />

        <Input
          label="Longitude (°E)"
          type="number"
          step="any"
          placeholder="e.g. 8.858349"
          required
          value={longitude}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : parseFloat(e.target.value);
            onLocationChange(latitude, val, zoneId);
          }}
          disabled={readOnly}
          helperText="Valid Nigerian longitude: 2.5 to 15.0"
        />
      </div>

      {/* Quick Action Tools: GPS capture & Swap Coordinates */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseDeviceLocation}
              isLoading={isLocating}
              className="text-xs gap-1.5 h-8"
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-500" />
              Use My Device GPS
            </Button>

            {latitude !== "" && longitude !== "" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSwapCoordinates}
                className="text-xs gap-1.5 h-8 text-slate-600 dark:text-slate-300"
                title="Swap Latitude and Longitude values"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Swap Lat/Lng
              </Button>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            Blast Radius: <strong>{radiusMeters}m</strong>
          </span>
        </div>
      )}

      {/* Geolocation Error Alert */}
      {geoError && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-800">
          {geoError}
        </p>
      )}

      {/* Coordinate Sanity Warning Alert */}
      {validation.warningMessage && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{validation.warningMessage}</p>
            {validation.isPossiblySwapped && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSwapCoordinates}
                className="text-[11px] h-6 px-2 mt-1 bg-amber-100 dark:bg-amber-900 border-amber-400 text-amber-900 dark:text-amber-100"
              >
                Swap to Fix Lat/Lng Now
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Map Tile Preview & Graceful Fallback Container */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
        {latitude !== "" && longitude !== "" && validation.isValid ? (
          <iframe
            title="Incident Location Preview"
            className="w-full h-full border-0 pointer-events-none opacity-90"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - 0.02}%2C${Number(latitude) - 0.02}%2C${Number(longitude) + 0.02}%2C${Number(latitude) + 0.02}&layer=mapnik&marker=${latitude}%2C${longitude}`}
            loading="lazy"
          />
        ) : (
          <div className="text-center p-4 space-y-1 text-slate-500">
            <Globe className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
            <p className="text-xs font-semibold">Enter coordinates or pick a zone</p>
            <p className="text-[10px] text-slate-600">
              Interactive map pin and radius preview will appear here
            </p>
          </div>
        )}

        {/* Map Center Marker Pin Overlay */}
        {latitude !== "" && longitude !== "" && validation.isValid && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500 animate-ping absolute" />
              <MapPin className="w-6 h-6 text-red-600 drop-shadow-md z-10" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
