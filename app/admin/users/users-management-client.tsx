"use client";

import * as React from "react";
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useBulkImportUsersMutation,
  type UsersFilterParams,
} from "@/hooks/queries/use-users";
import { useZonesQuery } from "@/hooks/queries/use-zones";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { RoleBadge, Badge } from "@/components/ui/badge";
import { MaskedPhone } from "@/components/ui/masked-phone";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import type { UserProfile, UserRole, Language } from "@/types";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MapPin,
  Crosshair,
  Upload,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export function UsersManagementClient() {
  const toast = useToast();
  const { data: zones } = useZonesQuery();

  // Filters state
  const [filters, setFilters] = React.useState<UsersFilterParams>({
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = React.useState("");

  const { data: userResult, isLoading, refetch } = useUsersQuery(filters);
  const users = userResult?.data || [];
  const totalUsers = userResult?.total || 0;
  const totalPages = userResult?.totalPages || 1;

  // Mutations
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deactivateUserMutation = useDeactivateUserMutation();
  const bulkImportMutation = useBulkImportUsersMutation();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);

  // Create form state
  const [regMode, setRegMode] = React.useState<"address" | "gps">("address");
  const [formPhone, setFormPhone] = React.useState("+234");
  const [formFullName, setFormFullName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formRole, setFormRole] = React.useState<UserRole>("RESIDENT");
  const [formLanguage, setFormLanguage] = React.useState<Language>("HAUSA");
  const [formAlertsEnabled, setFormAlertsEnabled] = React.useState(true);
  const [formZoneId, setFormZoneId] = React.useState("");
  const [formHouseNumber, setFormHouseNumber] = React.useState("");
  const [formAreaDesc, setFormAreaDesc] = React.useState("");
  const [formLat, setFormLat] = React.useState<number | "">("");
  const [formLng, setFormLng] = React.useState<number | "">("");
  const [formAutoPassword, setFormAutoPassword] = React.useState(true);
  const [formCustomPassword, setFormCustomPassword] = React.useState("");

  // Bulk CSV state
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [csvParsedRows, setCsvParsedRows] = React.useState<any[]>([]);
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [bulkOutcome, setBulkOutcome] = React.useState<any | null>(null);

  // Search debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhone || formPhone.length < 11) {
      toast.error("Valid Nigerian phone number (+234...) is required.", "Validation Error");
      return;
    }

    try {
      const password = formAutoPassword
        ? `Aegis${Math.floor(100000 + Math.random() * 900000)}!`
        : formCustomPassword || "AegisResident2026!";

      await createUserMutation.mutateAsync({
        phone: formPhone.trim(),
        fullName: formFullName.trim() || undefined,
        email: formEmail.trim() || undefined,
        role: formRole,
        preferredLanguage: formLanguage,
        alertsEnabled: formAlertsEnabled,
        zoneId: formZoneId || undefined,
        houseNumber: formHouseNumber.trim() || undefined,
        areaDescription: formAreaDesc.trim() || undefined,
        latitude: typeof formLat === "number" ? formLat : undefined,
        longitude: typeof formLng === "number" ? formLng : undefined,
        password,
      });

      toast.success(
        `User ${formFullName || formPhone} registered successfully. Default password: ${password}`,
        "User Registered"
      );

      setIsCreateModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message || errorObj.message || "Failed to create user.";
      toast.error(message, "Registration Error");
    }
  };

  const resetForm = () => {
    setFormPhone("+234");
    setFormFullName("");
    setFormEmail("");
    setFormRole("RESIDENT");
    setFormLanguage("HAUSA");
    setFormAlertsEnabled(true);
    setFormZoneId("");
    setFormHouseNumber("");
    setFormAreaDesc("");
    setFormLat("");
    setFormLng("");
    setFormAutoPassword(true);
    setFormCustomPassword("");
  };

  const handleToggleActive = async (user: UserProfile) => {
    try {
      if (user.isActive) {
        await deactivateUserMutation.mutateAsync(user.id);
        toast.info(`Account for ${user.phone} deactivated.`, "Deactivated");
      } else {
        await updateUserMutation.mutateAsync({ id: user.id, isActive: true });
        toast.success(`Account for ${user.phone} reactivated.`, "Reactivated");
      }
    } catch {
      toast.error("Failed to update user status.", "Error");
    }
  };

  // CSV parsing
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvError(null);
    setBulkOutcome(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setCsvError("CSV file must contain a header line and at least one data row.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const phoneIdx = headers.indexOf("phone");

    if (phoneIdx === -1) {
      setCsvError("CSV header must contain a 'phone' column.");
      return;
    }

    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < headers.length) continue;

      const rowObj: any = {
        phone: cols[phoneIdx],
        fullName: headers.indexOf("fullname") !== -1 ? cols[headers.indexOf("fullname")] : undefined,
        role: (headers.indexOf("role") !== -1 ? cols[headers.indexOf("role")] : "RESIDENT").toUpperCase(),
        preferredLanguage: (headers.indexOf("preferredlanguage") !== -1 ? cols[headers.indexOf("preferredlanguage")] : "HAUSA").toUpperCase(),
        alertsEnabled: true,
        houseNumber: headers.indexOf("housenumber") !== -1 ? cols[headers.indexOf("housenumber")] : undefined,
        areaDescription: headers.indexOf("areadescription") !== -1 ? cols[headers.indexOf("areadescription")] : undefined,
      };

      parsed.push(rowObj);
    }

    setCsvParsedRows(parsed);
  };

  const handleBulkSubmit = async () => {
    if (csvParsedRows.length === 0) return;
    try {
      const res = await bulkImportMutation.mutateAsync({
        users: csvParsedRows,
        dispatchCredentials: true,
      });

      setBulkOutcome(res);
      toast.success(
        `Imported ${res.successful} subscribers successfully (${res.failed} failed).`,
        "Bulk Import Completed"
      );
    } catch {
      toast.error("Failed to execute bulk import.", "Error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Community Subscriber Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage resident records, officer accounts, and flexible dual-mode registration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsBulkModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Bulk CSV Import
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Register New User
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-1">
              <Input
                placeholder="Search phone or name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div>
              <Select
                value={filters.role || "ALL"}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    role: e.target.value as any,
                    page: 1,
                  }))
                }
                options={[
                  { value: "ALL", label: "All Roles" },
                  { value: "RESIDENT", label: "Residents Only" },
                  { value: "SECURITY", label: "Security Officers" },
                  { value: "ADMIN", label: "Admins Only" },
                ]}
              />
            </div>

            {/* Language Filter */}
            <div>
              <Select
                value={filters.language || "ALL"}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    language: e.target.value as any,
                    page: 1,
                  }))
                }
                options={[
                  { value: "ALL", label: "All Languages" },
                  { value: "HAUSA", label: "Hausa" },
                  { value: "PIDGIN", label: "Pidgin" },
                  { value: "YORUBA", label: "Yoruba" },
                  { value: "IGBO", label: "Igbo" },
                  { value: "ENGLISH", label: "English" },
                ]}
              />
            </div>

            {/* Zone Filter */}
            <div>
              <Select
                value={filters.zoneId || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    zoneId: e.target.value || undefined,
                    page: 1,
                  }))
                }
                options={[
                  { value: "", label: "All Community Zones" },
                  ...(zones?.map((z) => ({ value: z.id, label: z.name })) || []),
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8">
            <LoadingState title="Loading user directory..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No subscribers match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Subscriber</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Zone / Address</th>
                  <th className="p-3">SMS Alerts</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {u.fullName || "Community Resident"}
                      </p>
                      {u.email && <span className="text-[11px] text-slate-400">{u.email}</span>}
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      <MaskedPhone phone={u.phone} />
                    </td>
                    <td className="p-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-3 font-mono text-[11px] font-semibold">{u.preferredLanguage}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {u.zoneName || "Zone Assigned"}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {u.houseNumber ? `Comp ${u.houseNumber}` : ""} {u.areaDescription || ""}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.alertsEnabled
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {u.alertsEnabled ? "ENABLED" : "OPTED OUT"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {u.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(u)}
                        className={`text-[11px] h-7 px-2 ${
                          u.isActive
                            ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <Button
              size="sm"
              variant="outline"
              disabled={(filters.page || 1) <= 1}
              onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <span className="text-slate-500 font-mono">
              Page {filters.page || 1} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={(filters.page || 1) >= totalPages}
              onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Flexible Dual-Mode Registration Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>Dual-Mode Community User Registration</span>
          </div>
        }
        description="Register residents via Zone & Compound address or device GPS coordinates"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-2 text-xs">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setRegMode("address")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                regMode === "address"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Mode 1: Zone & Compound Address (No GPS Required)
            </button>
            <button
              type="button"
              onClick={() => setRegMode("gps")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                regMode === "gps"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Mode 2: GPS Coordinates Enhanced
            </button>
          </div>

          {/* Core Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+2348012345678"
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              helperText="E.164 format (+234...)"
            />

            <Input
              label="Full Name"
              placeholder="e.g. Ibrahim Danladi"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="ibrahim@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />

            <Select
              label="System Role"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
              options={[
                { value: "RESIDENT", label: "Community Resident" },
                { value: "SECURITY", label: "Security Officer" },
                { value: "ADMIN", label: "System Administrator" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Preferred Alert Language"
              value={formLanguage}
              onChange={(e) => setFormLanguage(e.target.value as Language)}
              options={[
                { value: "HAUSA", label: "Hausa" },
                { value: "PIDGIN", label: "Nigerian Pidgin" },
                { value: "YORUBA", label: "Yoruba" },
                { value: "IGBO", label: "Igbo" },
                { value: "ENGLISH", label: "English" },
              ]}
            />

            <Select
              label="Home Community Zone"
              value={formZoneId}
              onChange={(e) => setFormZoneId(e.target.value)}
              options={[
                { value: "", label: "Select assigned zone..." },
                ...(zones?.map((z) => ({ value: z.id, label: z.name })) || []),
              ]}
            />
          </div>

          {/* Mode 1 Specific: Compound / Address description */}
          {regMode === "address" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Input
                label="House / Compound Number"
                placeholder="e.g. Compound 4B"
                value={formHouseNumber}
                onChange={(e) => setFormHouseNumber(e.target.value)}
              />

              <Input
                label="Street / Quarter / Landmark"
                placeholder="e.g. Near Central Mosque Road"
                value={formAreaDesc}
                onChange={(e) => setFormAreaDesc(e.target.value)}
              />
            </div>
          )}

          {/* Mode 2 Specific: GPS coordinate inputs */}
          {regMode === "gps" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Input
                label="Latitude (°N)"
                type="number"
                step="any"
                placeholder="e.g. 9.896521"
                value={formLat}
                onChange={(e) => setFormLat(e.target.value === "" ? "" : parseFloat(e.target.value))}
              />

              <Input
                label="Longitude (°E)"
                type="number"
                step="any"
                placeholder="e.g. 8.858349"
                value={formLng}
                onChange={(e) => setFormLng(e.target.value === "" ? "" : parseFloat(e.target.value))}
              />
            </div>
          )}

          {/* Password & Alerts Opt-In */}
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <Checkbox
              label="Emergency SMS Alerts Enabled by Default"
              description="Subscriber will immediately receive confirmed threat advisories for their zone."
              checked={formAlertsEnabled}
              onChange={(e) => setFormAlertsEnabled(e.target.checked)}
            />

            <Checkbox
              label="Auto-generate secure initial password and dispatch"
              checked={formAutoPassword}
              onChange={(e) => setFormAutoPassword(e.target.checked)}
            />

            {!formAutoPassword && (
              <Input
                label="Custom Initial Password"
                type="password"
                placeholder="Enter password..."
                value={formCustomPassword}
                onChange={(e) => setFormCustomPassword(e.target.value)}
              />
            )}
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              isLoading={createUserMutation.isPending}
            >
              Register Subscriber
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Bulk CSV Import Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Bulk CSV Community Resident Onboarding</span>
          </div>
        }
        description="Batch register community members with addresses or coordinates"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 bg-slate-50 dark:bg-slate-900">
            <Upload className="w-6 h-6 mx-auto text-slate-400" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Select or Drop Community CSV File
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {csvError && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-800">
              {csvError}
            </p>
          )}

          {csvParsedRows.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Parsed {csvParsedRows.length} Rows Ready for Import:
              </p>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Language</th>
                      <th className="p-2">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {csvParsedRows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono">{r.phone}</td>
                        <td className="p-2">{r.fullName || "—"}</td>
                        <td className="p-2 font-mono">{r.preferredLanguage}</td>
                        <td className="p-2">{r.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outcome Summary */}
          {bulkOutcome && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Bulk Import Completed
              </p>
              <p className="text-emerald-700 dark:text-emerald-300">
                Total Submitted: {bulkOutcome.totalSubmitted} • Successful: {bulkOutcome.successful} • Failed: {bulkOutcome.failed}
              </p>
            </div>
          )}

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkModalOpen(false)}
            >
              Close
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={csvParsedRows.length === 0 || bulkImportMutation.isPending}
              isLoading={bulkImportMutation.isPending}
              onClick={handleBulkSubmit}
            >
              Start Import ({csvParsedRows.length} Users)
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
