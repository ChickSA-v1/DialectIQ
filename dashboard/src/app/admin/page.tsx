"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { fetchAdminDashboardStats } from "@/lib/auth";
import type { AdminDashboardStats } from "@/lib/types";
import {
  DollarSign,
  Building2,
  MessageSquareText,
  CreditCard,
  Loader2,
  AlertTriangle,
  ClipboardList,
  Landmark,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PKG_COLORS: Record<string, string> = {
  basic: "#00D2DF",
  advanced: "#FBBF24",
  enterprise: "#8B5CF6",
};

const PKG_LABELS: Record<string, Record<string, string>> = {
  basic: { en: "Basic", ar: "أساسي" },
  advanced: { en: "Advanced", ar: "متقدم" },
  enterprise: { en: "Enterprise", ar: "مؤسسات" },
};

export default function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardStats()
      .then(setStats)
      .catch(() => alert("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!stats) return null;

  const kpiCards = [
    {
      label: t("admin.totalRevenue" as any),
      value: `${stats.total_revenue.toLocaleString()} ${t("admin.sar" as any)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t("admin.activeTenants" as any),
      value: stats.active_tenants.toString(),
      icon: Building2,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: t("admin.totalReviews" as any),
      value: stats.total_reviews.toLocaleString(),
      icon: MessageSquareText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: t("admin.activeSubscriptions" as any),
      value: stats.active_subscriptions.toString(),
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const pieData = stats.package_distribution.map((p) => ({
    name: PKG_LABELS[p.package]?.[locale] || p.package,
    value: p.count,
    color: PKG_COLORS[p.package] || "#94A3B8",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-cyan-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("admin.dashboard" as any)}
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pending_registrations > 0 || stats.pending_bank_transfers > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">
              {t("admin.pendingAlerts" as any)}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.pending_registrations > 0 && (
              <a
                href="/admin/registrations"
                className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-4 py-2 text-sm hover:bg-amber-100 transition-colors"
              >
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800">
                  {stats.pending_registrations}{" "}
                  {t("admin.pendingRegistrations" as any)}
                </span>
                <ArrowUpRight className="w-3 h-3 text-amber-500" />
              </a>
            )}
            {stats.pending_bank_transfers > 0 && (
              <a
                href="/admin/bank-transfers"
                className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-4 py-2 text-sm hover:bg-amber-100 transition-colors"
              >
                <Landmark className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800">
                  {stats.pending_bank_transfers}{" "}
                  {t("admin.pendingBankTransfers" as any)}
                </span>
                <ArrowUpRight className="w-3 h-3 text-amber-500" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t("admin.revenueTrend" as any)}
          </h3>
          {stats.revenue_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.revenue_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString()} ${locale === "ar" ? "ر.س" : "SAR"}`,
                    locale === "ar" ? "الإيرادات" : "Revenue",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#00D2DF"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              {t("admin.noActivity" as any)}
            </div>
          )}
        </div>

        {/* Package Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t("admin.packageDistribution" as any)}
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              {t("admin.noActivity" as any)}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          {t("admin.recentActivity" as any)}
        </h3>
        {stats.recent_activity.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_activity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                <div
                  className={`p-2 rounded-lg ${
                    activity.type === "payment"
                      ? "bg-emerald-50"
                      : activity.type === "registration"
                      ? "bg-blue-50"
                      : "bg-purple-50"
                  }`}
                >
                  {activity.type === "payment" ? (
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  ) : activity.type === "registration" ? (
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Building2 className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.tenant_name}
                  </p>
                  <p className="text-xs text-gray-500">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleDateString(
                    locale === "ar" ? "ar-SA" : "en-US",
                    { month: "short", day: "numeric" }
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            {t("admin.noActivity" as any)}
          </p>
        )}
      </div>
    </div>
  );
}
