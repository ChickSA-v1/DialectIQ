"use client";

import { DashboardStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { CHART_COLORS } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type PieLabelRenderProps,
} from "recharts";

interface Props {
  stats: DashboardStats;
}

const URGENCY_COLORS: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#10b981",
};

export default function BreakdownCharts({ stats }: Props) {
  const { t, locale } = useI18n();

  const urgencyData = Object.entries(stats.urgency_breakdown).map(
    ([name, value]) => ({
      name: t(`urgency.${name}` as any),
      value,
      key: name,
    }),
  );

  const categoryData = Object.entries(stats.category_breakdown)
    .map(([name, value]) => ({
      name: t(`cat.${name}` as any),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const dialectData = Object.entries(stats.dialect_breakdown)
    .map(([name, value]) => ({
      name: t(`dialect.${name}` as any),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const isEmpty =
    urgencyData.length === 0 &&
    categoryData.length === 0 &&
    dialectData.length === 0;

  if (isEmpty) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        {t("chart.noAnalysis")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Urgency Pie */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t("chart.urgencyBreakdown")}
        </h3>
        {urgencyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={urgencyData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(props: PieLabelRenderProps) =>
                  `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {urgencyData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={URGENCY_COLORS[entry.key] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">
            {t("chart.noData")}
          </p>
        )}
      </div>

      {/* Category Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t("chart.categories")}
        </h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ left: locale === "ar" ? 0 : 10, right: locale === "ar" ? 10 : 0 }}
            >
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                fontSize={11}
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">
            {t("chart.noData")}
          </p>
        )}
      </div>

      {/* Dialect Pie */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t("chart.dialectDistribution")}
        </h3>
        {dialectData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dialectData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(props: PieLabelRenderProps) =>
                  `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {dialectData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">
            {t("chart.noData")}
          </p>
        )}
      </div>
    </div>
  );
}
