"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  fetchRevenueReport,
  fetchTenantActivityReport,
  exportReport,
} from "@/lib/auth";
import type {
  RevenueReportResponse,
  TenantActivityResponse,
} from "@/lib/types";
import {
  BarChart3,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  Receipt,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type TabKey = "revenue" | "tenants" | "vat";

const TAB_LABELS: Record<TabKey, Record<string, string>> = {
  revenue: { en: "Revenue", ar: "الإيرادات" },
  tenants: { en: "Tenants", ar: "المنشآت" },
  vat: { en: "VAT", ar: "الضريبة" },
};

const TAB_ICONS: Record<TabKey, typeof Receipt> = {
  revenue: Receipt,
  tenants: Building2,
  vat: FileText,
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  approved: "bg-blue-100 text-blue-700",
  pending_review: "bg-amber-100 text-amber-700",
  suspended: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-700",
};

const PKG_LABELS: Record<string, Record<string, string>> = {
  basic: { en: "Basic", ar: "أساسي" },
  advanced: { en: "Advanced", ar: "متقدم" },
  enterprise: { en: "Enterprise", ar: "مؤسسات" },
};

export default function ReportsPage() {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>("revenue");
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  // Revenue data
  const [revenueData, setRevenueData] = useState<RevenueReportResponse | null>(
    null
  );

  // Tenant activity data
  const [tenantData, setTenantData] =
    useState<TenantActivityResponse | null>(null);
  const [tenantPage, setTenantPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "revenue" || activeTab === "vat") {
        const res = await fetchRevenueReport({
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        });
        setRevenueData(res);
      } else if (activeTab === "tenants") {
        const res = await fetchTenantActivityReport({ page: tenantPage });
        setTenantData(res);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, tenantPage]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReport(activeTab, {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  };

  // Aggregate revenue by month for chart
  const chartData =
    revenueData?.items.reduce(
      (acc, item) => {
        const existing = acc.find((a) => a.month === item.month);
        if (existing) {
          existing.revenue += item.revenue;
          existing.vat += item.vat;
          existing.total += item.total_with_vat;
        } else {
          acc.push({
            month: item.month,
            revenue: item.revenue,
            vat: item.vat,
            total: item.total_with_vat,
          });
        }
        return acc;
      },
      [] as { month: string; revenue: number; vat: number; total: number }[]
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-cyan-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.reports" as any)}
          </h1>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {t("admin.exportCsv" as any)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["revenue", "tenants", "vat"] as TabKey[]).map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white text-cyan-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {TAB_LABELS[tab][locale]}
            </button>
          );
        })}
      </div>

      {/* Date Filter (for revenue and vat) */}
      {(activeTab === "revenue" || activeTab === "vat") && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-end gap-4">
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
              onClick={loadData}
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              {locale === "ar" ? "تطبيق" : "Apply"}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : (
        <>
          {/* Revenue Tab */}
          {activeTab === "revenue" && revenueData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("admin.revenue" as any)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenueData.total_revenue.toLocaleString()}{" "}
                    {t("admin.sar" as any)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("admin.vat" as any)}
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {revenueData.total_vat.toLocaleString()}{" "}
                    {t("admin.sar" as any)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("admin.total" as any)}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {revenueData.total_with_vat.toLocaleString()}{" "}
                    {t("admin.sar" as any)}
                  </p>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("admin.revenueTrend" as any)}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        name={locale === "ar" ? "الإيرادات" : "Revenue"}
                        fill="#00D2DF"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="vat"
                        name={locale === "ar" ? "الضريبة" : "VAT"}
                        fill="#FBBF24"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Detail Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.month" as any)}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.package")}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.invoiceCount" as any)}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.revenue" as any)}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.vat" as any)}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.total" as any)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{item.month}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">
                            {PKG_LABELS[item.package]?.[locale] || item.package}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.invoice_count}</td>
                        <td className="px-4 py-3">
                          {item.revenue.toLocaleString()} {t("admin.sar" as any)}
                        </td>
                        <td className="px-4 py-3 text-amber-600">
                          {item.vat.toLocaleString()} {t("admin.sar" as any)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {item.total_with_vat.toLocaleString()}{" "}
                          {t("admin.sar" as any)}
                        </td>
                      </tr>
                    ))}
                    {revenueData.items.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          {t("admin.noInvoices" as any)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tenants Tab */}
          {activeTab === "tenants" && tenantData && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.businessName")}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.email")}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.package")}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.status")}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.reviewsUsage" as any)}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.subscription" as any)}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.expiresAt" as any)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantData.tenants.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.name_ar}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {item.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">
                            {PKG_LABELS[item.package]?.[locale] || item.package}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_STYLES[item.status] ||
                              "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-24">
                              <div
                                className="h-2 bg-cyan-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (item.reviews_used / item.max_reviews) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {item.reviews_used}/{item.max_reviews}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.subscription_status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.subscription_status === "expired"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.subscription_status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {item.subscription_expires_at
                            ? new Date(
                                item.subscription_expires_at
                              ).toLocaleDateString(
                                locale === "ar" ? "ar-SA" : "en-US"
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {tenantData.tenants.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          {t("admin.noTenants")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {tenantData.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                  <button
                    onClick={() => setTenantPage((p) => Math.max(1, p - 1))}
                    disabled={tenantPage <= 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {tenantPage} / {tenantData.total_pages}
                  </span>
                  <button
                    onClick={() =>
                      setTenantPage((p) =>
                        Math.min(tenantData.total_pages, p + 1)
                      )
                    }
                    disabled={tenantPage >= tenantData.total_pages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VAT Tab */}
          {activeTab === "vat" && revenueData && (
            <div className="space-y-6">
              {/* VAT Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    {locale === "ar"
                      ? "إجمالي ضريبة القيمة المضافة"
                      : "Total VAT Collected"}
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {revenueData.total_vat.toLocaleString()}{" "}
                    {t("admin.sar" as any)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500 mb-1">
                    {locale === "ar"
                      ? "الإجمالي شامل الضريبة"
                      : "Total Including VAT"}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {revenueData.total_with_vat.toLocaleString()}{" "}
                    {t("admin.sar" as any)}
                  </p>
                </div>
              </div>

              {/* VAT Monthly Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    {locale === "ar"
                      ? "تقرير ضريبة القيمة المضافة الشهري"
                      : "Monthly VAT Report"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {locale === "ar"
                      ? "متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك"
                      : "ZATCA compliant VAT breakdown"}
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {t("admin.month" as any)}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {locale === "ar"
                          ? "الإيرادات قبل الضريبة"
                          : "Revenue (excl. VAT)"}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {locale === "ar"
                          ? "ضريبة القيمة المضافة (15%)"
                          : "VAT (15%)"}
                      </th>
                      <th className="text-start px-4 py-3 font-medium text-gray-500">
                        {locale === "ar"
                          ? "الإجمالي شامل الضريبة"
                          : "Total (incl. VAT)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">{row.month}</td>
                        <td className="px-4 py-3">
                          {row.revenue.toLocaleString()} {t("admin.sar" as any)}
                        </td>
                        <td className="px-4 py-3 text-amber-600 font-medium">
                          {row.vat.toLocaleString()} {t("admin.sar" as any)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {row.total.toLocaleString()} {t("admin.sar" as any)}
                        </td>
                      </tr>
                    ))}
                    {chartData.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          {t("admin.noInvoices" as any)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {chartData.length > 0 && (
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr className="font-bold">
                        <td className="px-4 py-3">
                          {locale === "ar" ? "الإجمالي" : "Total"}
                        </td>
                        <td className="px-4 py-3">
                          {revenueData.total_revenue.toLocaleString()}{" "}
                          {t("admin.sar" as any)}
                        </td>
                        <td className="px-4 py-3 text-amber-600">
                          {revenueData.total_vat.toLocaleString()}{" "}
                          {t("admin.sar" as any)}
                        </td>
                        <td className="px-4 py-3 text-emerald-600">
                          {revenueData.total_with_vat.toLocaleString()}{" "}
                          {t("admin.sar" as any)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
