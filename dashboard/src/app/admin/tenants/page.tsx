"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { fetchTenants, activateTenant } from "@/lib/auth";
import { TenantInfo } from "@/lib/types";
import {
  CheckCircle,
  Key,
  Loader2,
  Copy,
  Building2,
} from "lucide-react";

export default function TenantsPage() {
  const { t } = useI18n();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

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

  const handleActivate = async (tenantId: string) => {
    setActivating(tenantId);
    try {
      const res = await activateTenant(tenantId);
      alert(`${t("admin.activated")} — API Key: ${res.api_key}`);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActivating(null);
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
        <h1 className="text-xl font-bold text-gray-900">{t("admin.tenants")}</h1>
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
                    {tenant.reviews_used_this_month} / {tenant.max_reviews_per_month}
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
                    {tenant.status === "approved" && (
                      <button
                        onClick={() => handleActivate(tenant.id)}
                        disabled={activating === tenant.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {activating === tenant.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {t("admin.activate")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
