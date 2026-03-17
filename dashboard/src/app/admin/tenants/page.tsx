"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  fetchTenants,
  activateTenant,
  deactivateTenant,
  reactivateTenant,
  editTenant,
  adminSearchPlaces,
  adminAddPlaceId,
  adminRemovePlaceId,
  adminApprovePendingPlace,
  adminRejectPendingPlace,
} from "@/lib/auth";
import { TenantInfo, PlaceSearchResult } from "@/lib/types";
import {
  CheckCircle,
  Key,
  Loader2,
  Copy,
  Building2,
  Pencil,
  Power,
  PowerOff,
  X,
  Save,
  MapPin,
  Search,
  Plus,
  Trash2,
  Star,
  ChevronDown,
  ChevronUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export default function TenantsPage() {
  const { t } = useI18n();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  // Edit modal state
  const [editingTenant, setEditingTenant] = useState<TenantInfo | null>(null);
  const [editForm, setEditForm] = useState({
    name_ar: "",
    name_en: "",
    email: "",
    phone: "",
    package: "",
    card_payment_enabled: false,
  });
  const [editSaving, setEditSaving] = useState(false);

  // Confirm deactivate state
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(
    null
  );

  // Place ID management state
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearchResults, setPlaceSearchResults] = useState<
    PlaceSearchResult[]
  >([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const [placeAdding, setPlaceAdding] = useState<string | null>(null);
  const [placeRemoving, setPlaceRemoving] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchTenants(statusFilter || undefined);
      setTenants(res.tenants);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  // ── Actions ──

  const handleActivate = async (tenantId: string) => {
    setActionLoading(tenantId);
    try {
      const res = await activateTenant(tenantId);
      alert(`${t("admin.activated" as any)} — API Key: ${res.api_key}`);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (tenantId: string) => {
    setActionLoading(tenantId);
    try {
      await deactivateTenant(tenantId);
      setConfirmDeactivate(null);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (tenantId: string) => {
    setActionLoading(tenantId);
    try {
      const res = await reactivateTenant(tenantId);
      alert(`${t("admin.reactivated" as any)} — API Key: ${res.api_key}`);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (tenant: TenantInfo) => {
    setEditingTenant(tenant);
    setEditForm({
      name_ar: tenant.name_ar,
      name_en: tenant.name_en || "",
      email: tenant.email,
      phone: tenant.phone,
      package: tenant.package,
      card_payment_enabled: tenant.card_payment_enabled ?? false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTenant) return;
    setEditSaving(true);
    try {
      await editTenant(editingTenant.id, editForm);
      setEditingTenant(null);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── Place ID Actions ──

  const togglePlaces = (tenantId: string) => {
    if (expandedTenant === tenantId) {
      setExpandedTenant(null);
      setPlaceSearchResults([]);
      setPlaceSearchQuery("");
    } else {
      setExpandedTenant(tenantId);
      setPlaceSearchResults([]);
      setPlaceSearchQuery("");
    }
  };

  const handlePlaceSearch = async (tenantId: string) => {
    if (!placeSearchQuery.trim()) return;
    setPlaceSearching(true);
    try {
      const res = await adminSearchPlaces(tenantId, placeSearchQuery.trim());
      setPlaceSearchResults(res.results);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPlaceSearching(false);
    }
  };

  const handleAddPlace = async (tenantId: string, placeId: string) => {
    setPlaceAdding(placeId);
    try {
      await adminAddPlaceId(tenantId, placeId);
      setPlaceSearchResults([]);
      setPlaceSearchQuery("");
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPlaceAdding(null);
    }
  };

  const handleRemovePlace = async (tenantId: string, placeId: string) => {
    setPlaceRemoving(placeId);
    try {
      await adminRemovePlaceId(tenantId, placeId);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPlaceRemoving(null);
    }
  };

  const handleApprovePending = async (tenantId: string, placeId: string) => {
    setPendingAction(placeId);
    try {
      await adminApprovePendingPlace(tenantId, placeId);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleRejectPending = async (tenantId: string, placeId: string) => {
    setPendingAction(placeId);
    try {
      await adminRejectPendingPlace(tenantId, placeId);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPendingAction(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      approved: "bg-blue-100 text-blue-700",
      pending_review: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
      suspended: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-500";
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {t("admin.tenants")}
        </h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
        >
          <option value="">{t("admin.allStatuses")}</option>
          <option value="active">{t("tenant.active")}</option>
          <option value="approved">{t("tenant.approved")}</option>
          <option value="pending_review">{t("tenant.pending_review")}</option>
          <option value="rejected">{t("tenant.rejected")}</option>
          <option value="suspended">{t("tenant.suspended")}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">{t("admin.noTenants")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Main row */}
              <div className="flex items-center gap-4 px-4 py-3 text-sm">
                {/* Business Name */}
                <div className="flex items-center gap-2 min-w-[200px] flex-1">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-800">
                      {tenant.name_ar}
                    </div>
                    <div className="text-xs text-gray-400">{tenant.email}</div>
                  </div>
                </div>

                {/* Package */}
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs font-medium">
                  {t(`package.${tenant.package}` as any)}
                </span>

                {/* Status */}
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(tenant.status)}`}
                >
                  {t(`tenant.${tenant.status}` as any)}
                </span>

                {/* Payment */}
                {tenant.latest_invoice_status ? (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tenant.latest_invoice_status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : tenant.latest_invoice_status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {t(`payment.${tenant.latest_invoice_status}` as any)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    {t("payment.none")}
                  </span>
                )}

                {/* Reviews */}
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {tenant.reviews_used_this_month}/{tenant.max_reviews_per_month}
                </span>

                {/* API Key */}
                {tenant.api_key ? (
                  <button
                    onClick={() => copyKey(tenant.api_key!)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-mono"
                  >
                    <Key className="w-3 h-3" />
                    {tenant.api_key.slice(0, 12)}...
                    <Copy className="w-3 h-3" />
                    {copiedKey === tenant.api_key && (
                      <span className="text-emerald-600 ms-1">
                        {t("admin.copied")}
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Place IDs toggle */}
                  <button
                    onClick={() => togglePlaces(tenant.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                      expandedTenant === tenant.id
                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                        : "text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    {tenant.place_ids?.length || 0}
                    {(tenant.pending_place_ids?.length || 0) > 0 && (
                      <span className="bg-amber-100 text-amber-700 px-1 rounded text-[10px]">
                        +{tenant.pending_place_ids!.length}
                      </span>
                    )}
                    {expandedTenant === tenant.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(tenant)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                    title={t("admin.edit" as any)}
                  >
                    <Pencil className="w-3 h-3" />
                    {t("admin.edit" as any)}
                  </button>

                  {/* Activate */}
                  {tenant.status === "approved" && (
                    <button
                      onClick={() => handleActivate(tenant.id)}
                      disabled={actionLoading === tenant.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === tenant.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {t("admin.activate")}
                    </button>
                  )}

                  {/* Deactivate */}
                  {tenant.status === "active" && (
                    <>
                      {confirmDeactivate === tenant.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeactivate(tenant.id)}
                            disabled={actionLoading === tenant.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === tenant.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <PowerOff className="w-3 h-3" />
                            )}
                            {t("admin.deactivate" as any)}
                          </button>
                          <button
                            onClick={() => setConfirmDeactivate(null)}
                            className="px-2 py-1.5 text-gray-500 border border-gray-200 rounded-lg text-xs hover:bg-gray-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeactivate(tenant.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          <PowerOff className="w-3 h-3" />
                          {t("admin.deactivate" as any)}
                        </button>
                      )}
                    </>
                  )}

                  {/* Reactivate */}
                  {tenant.status === "suspended" && (
                    <button
                      onClick={() => handleReactivate(tenant.id)}
                      disabled={actionLoading === tenant.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === tenant.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Power className="w-3 h-3" />
                      )}
                      {t("admin.reactivate" as any)}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Expanded Place IDs panel ── */}
              {expandedTenant === tenant.id && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {t("admin.placeIds" as any)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({tenant.place_ids?.length || 0} /{" "}
                      {tenant.max_businesses})
                    </span>
                  </div>

                  {/* Current Place IDs */}
                  {tenant.place_ids && tenant.place_ids.length > 0 ? (
                    <div className="space-y-1.5 mb-4">
                      {tenant.place_ids.map((pid) => (
                        <div
                          key={pid}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <span className="text-xs font-mono text-gray-700 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            {pid}
                          </span>
                          <button
                            onClick={() =>
                              handleRemovePlace(tenant.id, pid)
                            }
                            disabled={placeRemoving === pid}
                            className="flex items-center gap-1 px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs transition-colors disabled:opacity-50"
                          >
                            {placeRemoving === pid ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            {t("admin.removePlaceId" as any)}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mb-4">
                      {t("admin.noPlaceIds" as any)}
                    </p>
                  )}

                  {/* Pending Place IDs */}
                  {tenant.pending_place_ids && tenant.pending_place_ids.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">
                          Pending Approval ({tenant.pending_place_ids.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {tenant.pending_place_ids.map((pid) => (
                          <div
                            key={pid}
                            className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                          >
                            <span className="text-xs font-mono text-gray-700 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-amber-500" />
                              {pid}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleApprovePending(tenant.id, pid)}
                                disabled={pendingAction === pid}
                                className="flex items-center gap-1 px-2 py-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded text-xs transition-colors disabled:opacity-50"
                              >
                                {pendingAction === pid ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ThumbsUp className="w-3 h-3" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectPending(tenant.id, pid)}
                                disabled={pendingAction === pid}
                                className="flex items-center gap-1 px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs transition-colors disabled:opacity-50"
                              >
                                {pendingAction === pid ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ThumbsDown className="w-3 h-3" />
                                )}
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search & Add */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={placeSearchQuery}
                      onChange={(e) => setPlaceSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handlePlaceSearch(tenant.id)
                      }
                      placeholder={t("admin.searchBusiness" as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                      dir="auto"
                    />
                    <button
                      onClick={() => handlePlaceSearch(tenant.id)}
                      disabled={placeSearching || !placeSearchQuery.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {placeSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      {t("client.searchBusiness")}
                    </button>
                  </div>

                  {/* Search results */}
                  {placeSearchResults.length > 0 && (
                    <div className="space-y-2">
                      {placeSearchResults.map((place) => {
                        const alreadyAdded = tenant.place_ids?.includes(
                          place.place_id
                        );
                        return (
                          <div
                            key={place.place_id}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {place.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {place.address}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {place.rating && (
                                  <span className="flex items-center gap-0.5 text-xs text-amber-600">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {place.rating}
                                  </span>
                                )}
                                {place.user_ratings_total != null && (
                                  <span className="text-xs text-gray-400">
                                    ({place.user_ratings_total}{" "}
                                    {t("client.reviews")})
                                  </span>
                                )}
                                <span className="text-xs text-gray-300 font-mono">
                                  {place.place_id}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleAddPlace(tenant.id, place.place_id)
                              }
                              disabled={
                                !!alreadyAdded ||
                                placeAdding === place.place_id
                              }
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ms-3 shrink-0"
                            >
                              {placeAdding === place.place_id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : alreadyAdded ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                              {alreadyAdded
                                ? t("client.alreadyAdded")
                                : t("admin.addPlaceId" as any)}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {t("admin.editTenant" as any)}
              </h2>
              <button
                onClick={() => setEditingTenant(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.nameAr" as any)}
                </label>
                <input
                  value={editForm.name_ar}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name_ar: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.nameEn" as any)}
                </label>
                <input
                  value={editForm.name_en}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name_en: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.email" as any)}
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.phone" as any)}
                </label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.package")}
                </label>
                <select
                  value={editForm.package}
                  onChange={(e) =>
                    setEditForm({ ...editForm, package: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="basic">{t("package.basic")}</option>
                  <option value="advanced">{t("package.advanced")}</option>
                  <option value="enterprise">{t("package.enterprise")}</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Card Payment (HyperPay)
                  </label>
                  <p className="text-xs text-gray-400">
                    Enable online card payment for this tenant
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      card_payment_enabled: !editForm.card_payment_enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editForm.card_payment_enabled
                      ? "bg-cyan-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editForm.card_payment_enabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("admin.cancel")}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {editSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t("admin.save" as any)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
