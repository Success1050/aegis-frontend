"use client";

import * as React from "react";
import {
  useZonesQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
} from "@/hooks/queries/use-zones";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import type { Zone } from "@/types";
import {
  MapPin,
  PlusCircle,
  Edit,
  Radio,
  Users,
  CheckCircle2,
  Globe,
  Compass,
} from "lucide-react";

export function ZonesManagementClient() {
  const toast = useToast();
  const { data: zones, isLoading, refetch } = useZonesQuery();

  const createZoneMutation = useCreateZoneMutation();
  const updateZoneMutation = useUpdateZoneMutation();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingZone, setEditingZone] = React.useState<Zone | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [centerLat, setCenterLat] = React.useState<number | "">("");
  const [centerLng, setCenterLng] = React.useState<number | "">("");
  const [radiusMeters, setRadiusMeters] = React.useState<number>(2000);

  const openCreateModal = () => {
    setEditingZone(null);
    setName("");
    setDescription("");
    setCenterLat(9.8965);
    setCenterLng(8.8583);
    setRadiusMeters(2000);
    setIsModalOpen(true);
  };

  const openEditModal = (zone: Zone) => {
    setEditingZone(zone);
    setName(zone.name);
    setDescription(zone.description || "");
    setCenterLat(Number(zone.centerLat));
    setCenterLng(Number(zone.centerLng));
    setRadiusMeters(zone.radiusMeters);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Zone name is required.", "Validation Error");
      return;
    }
    if (centerLat === "" || centerLng === "") {
      toast.error("Center coordinates are required.", "Validation Error");
      return;
    }

    try {
      if (editingZone) {
        await updateZoneMutation.mutateAsync({
          id: editingZone.id,
          name: name.trim(),
          description: description.trim() || undefined,
          centerLat: Number(centerLat),
          centerLng: Number(centerLng),
          radiusMeters,
        });
        toast.success(`Zone ${name} updated successfully.`, "Zone Updated");
      } else {
        await createZoneMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          centerLat: Number(centerLat),
          centerLng: Number(centerLng),
          radiusMeters,
        });
        toast.success(`Zone ${name} created successfully.`, "Zone Created");
      }

      setIsModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj?.response?.data?.message || errorObj.message || "Failed to save zone.";
      toast.error(msg, "Error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            <span>Community Geofence Zones</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define protected wards, boundary coordinates, and default emergency blast radii.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          Create Community Zone
        </Button>
      </div>

      {/* Zones Grid */}
      {isLoading ? (
        <LoadingState title="Loading community zones..." />
      ) : zones?.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          No community zones defined yet. Click &quot;Create Community Zone&quot; to add your first zone.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones?.map((zone) => (
            <Card key={zone.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                {/* Map Preview Header */}
                <div className="relative w-full h-32 bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                  <iframe
                    title={zone.name}
                    className="w-full h-full border-0 pointer-events-none opacity-85"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(zone.centerLng) - 0.02}%2C${Number(zone.centerLat) - 0.02}%2C${Number(zone.centerLng) + 0.02}%2C${Number(zone.centerLat) + 0.02}&layer=mapnik&marker=${zone.centerLat}%2C${zone.centerLng}`}
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-200">
                    Radius: {zone.radiusMeters}m
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                      {zone.name}
                    </CardTitle>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      ACTIVE
                    </span>
                  </div>
                  {zone.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {zone.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div>
                      <span className="text-slate-400">Center Lat:</span>
                      <p className="font-mono font-bold">{Number(zone.centerLat).toFixed(4)}° N</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Center Lng:</span>
                      <p className="font-mono font-bold">{Number(zone.centerLng).toFixed(4)}° E</p>
                    </div>
                  </div>

                  {zone._count && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        Members: <strong>{zone._count.users || 0}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 text-red-500" />
                        Incidents: <strong>{zone._count.incidents || 0}</strong>
                      </span>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(zone)}
                  className="w-full text-xs gap-1.5 mt-3"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Geofence Parameters
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Zone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span>{editingZone ? "Edit Community Zone" : "Create Community Zone"}</span>
          </div>
        }
        description="Configure geofence coordinates and default coverage radius"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          <Input
            label="Zone Name"
            placeholder="e.g. Kujama North Ward"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            label="Description / Ward Details"
            placeholder="Describe the coverage area and community landmarks..."
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Center Latitude (°N)"
              type="number"
              step="any"
              placeholder="e.g. 9.8965"
              required
              value={centerLat}
              onChange={(e) => setCenterLat(e.target.value === "" ? "" : parseFloat(e.target.value))}
            />

            <Input
              label="Center Longitude (°E)"
              type="number"
              step="any"
              placeholder="e.g. 8.8583"
              required
              value={centerLng}
              onChange={(e) => setCenterLng(e.target.value === "" ? "" : parseFloat(e.target.value))}
            />
          </div>

          <Input
            label="Default Alert Radius (Meters)"
            type="number"
            min={100}
            max={25000}
            step={100}
            required
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(Number(e.target.value))}
            helperText="Default radius for incidents declared within this ward. Standard: 2,000m."
          />

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              isLoading={createZoneMutation.isPending || updateZoneMutation.isPending}
            >
              {editingZone ? "Update Geofence" : "Create Zone"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
