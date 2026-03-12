"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  fetchTenants,
  activateTenant,
  deactivateTenant,
  reactivateTenant,
  editTenant,
} from "@/lib/auth";
import { TenantInfo } from "@/lib/types";
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
  });
  const [editSaving, setEditSaving] = useState(false);

  // Confirm deactivate state
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(
    null
  );

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
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">
                  {t("admin.businessName")}
                </th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">
                  {t("admin.package")}
                </th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">
                  {t("admin.status")}
                </th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">
                  {t("payment.status")}
                </th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">
                  {t("admin.reviewsUsed")}
                </th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">
                  {t("admin.apiKey")}
                </th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">
                  {t("admin.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-800">
                          {tenant.name_ar}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      {t(`package.${tenant.package}` as any)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(tenant.status)}`}
                    >
                      {t(`tenant.${tenant.status}` as any)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tenant.reviews_used_this_month} /{" "}
                    {tenant.max_reviews_per_month}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Edit button — always visible */}
                      <button
                        onClick={() => openEdit(tenant)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        title={t("admin.edit" as any)}
                      >
                        <Pencil className="w-3 h-3" />
                        {t("admin.edit" as any)}
                      </button>

                      {/* Activate — for approved tenants */}
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

                      {/* Deactivate — for active tenants */}
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
                              onClick={() =>
                                setConfirmDeactivate(tenant.id)
                              }
                              className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                            >
                              <PowerOff className="w-3 h-3" />
                              {t("admin.deactivate" as any)}
                            </button>
                          )}
                        </>
                      )}

                      {/* Reactivate — for suspended tenants */}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="basic">{t("package.basic")}</option>
                  <option value="advanced">{t("package.advanced")}</option>
                  <option value="enterprise">{t("package.enterprise")}</option>
                </select>
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
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
