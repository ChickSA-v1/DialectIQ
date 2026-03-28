"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  fetchAdminInvoices,
  downloadAdminInvoicePdf,
  createManualInvoice,
  fetchTenants,
} from "@/lib/auth";
import type { AdminInvoiceItem, TenantInfo } from "@/lib/types";
import {
  Receipt,
  Loader2,
  Download,
  Plus,
  X,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  paid: { en: "Paid", ar: "مدفوع" },
  pending: { en: "Pending", ar: "معلق" },
  failed: { en: "Failed", ar: "فشل" },
  refunded: { en: "Refunded", ar: "مسترد" },
};

const METHOD_LABELS: Record<string, Record<string, string>> = {
  card: { en: "Card", ar: "بطاقة" },
  bank_transfer: { en: "Bank Transfer", ar: "تحويل بنكي" },
};

export default function InvoicesPage() {
  const { t, locale } = useI18n();
  const [invoices, setInvoices] = useState<AdminInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [createData, setCreateData] = useState({
    tenant_id: "",
    package: "basic",
    amount_sar: "",
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminInvoices({
        status: filterStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
      });
      setInvoices(res.invoices);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [page, filterStatus]);

  const handleDownloadPdf = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      await downloadAdminInvoicePdf(invoiceId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCreateModal = async () => {
    try {
      const res = await fetchTenants();
      setTenants(res.tenants.filter((t) => t.status !== "deleted"));
    } catch {
      /* ignore */
    }
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!createData.tenant_id) return alert(t("admin.selectTenant" as any));
    setActionLoading("create");
    try {
      await createManualInvoice({
        tenant_id: createData.tenant_id,
        package: createData.package,
        amount_sar: createData.amount_sar
          ? parseFloat(createData.amount_sar)
          : undefined,
      });
      alert(t("admin.invoiceCreated" as any));
      setShowCreateModal(false);
      setCreateData({ tenant_id: "", package: "basic", amount_sar: "" });
      loadInvoices();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilter = () => {
    setPage(1);
    loadInvoices();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Receipt className="w-6 h-6 text-cyan-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.invoices" as any)}
          </h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t("admin.createInvoice" as any)}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t("admin.status")}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t("admin.allInvoices" as any)}</option>
              <option value="paid">
                {STATUS_LABELS.paid[locale]}
              </option>
              <option value="pending">
                {STATUS_LABELS.pending[locale]}
              </option>
              <option value="failed">
                {STATUS_LABELS.failed[locale]}
              </option>
              <option value="refunded">
                {STATUS_LABELS.refunded[locale]}
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t("admin.dateFrom" as any)}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t("admin.dateTo" as any)}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleFilter}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            {locale === "ar" ? "بحث" : "Search"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">{t("admin.noInvoices" as any)}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.invoiceNumber" as any)}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.tenant" as any)}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.amount" as any)}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.vat" as any)}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.total" as any)}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.status")}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.paymentMethod" as any)}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.date" as any)}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">
                    {t("admin.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {inv.invoice_number || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {inv.tenant_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {inv.tenant_email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {inv.amount_sar.toLocaleString()} {t("admin.sar" as any)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.vat_amount?.toLocaleString() || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {inv.total_with_vat?.toLocaleString() || "—"}{" "}
                      {t("admin.sar" as any)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES[inv.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[inv.status]?.[locale] || inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.payment_method
                        ? METHOD_LABELS[inv.payment_method]?.[locale] ||
                          inv.payment_method
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(inv.created_at).toLocaleDateString(
                        locale === "ar" ? "ar-SA" : "en-US"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {inv.invoice_pdf_url && (
                        <button
                          onClick={() => handleDownloadPdf(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium disabled:opacity-50"
                        >
                          {actionLoading === inv.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {t("admin.createInvoice" as any)}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.selectTenant" as any)}
                </label>
                <select
                  value={createData.tenant_id}
                  onChange={(e) =>
                    setCreateData({ ...createData, tenant_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">--</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name_ar} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.selectPackage" as any)}
                </label>
                <select
                  value={createData.package}
                  onChange={(e) =>
                    setCreateData({ ...createData, package: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="basic">
                    {locale === "ar" ? "أساسي" : "Basic"} - 500 SAR
                  </option>
                  <option value="advanced">
                    {locale === "ar" ? "متقدم" : "Advanced"} - 1,500 SAR
                  </option>
                  <option value="enterprise">
                    {locale === "ar" ? "مؤسسات" : "Enterprise"} - 2,500 SAR
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.customAmount" as any)}
                </label>
                <input
                  type="number"
                  value={createData.amount_sar}
                  onChange={(e) =>
                    setCreateData({ ...createData, amount_sar: e.target.value })
                  }
                  placeholder={locale === "ar" ? "اختياري" : "Optional"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                {t("admin.cancel")}
              </button>
              <button
                onClick={handleCreate}
                disabled={actionLoading === "create"}
                className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === "create" && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {t("admin.createInvoice" as any)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
