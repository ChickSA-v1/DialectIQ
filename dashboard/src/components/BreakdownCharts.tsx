"use client";

import { DashboardStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import InsightCard from "./InsightCard";
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
  High: "#f43f5e",
  Medium: "#f59e0b",
  Low: "#10b981",
};

const DIALECT_COLORS = ["#7c3aed", "#a855f7", "#c084fc", "#4f46e5", "#818cf8", "#6366f1"];

const CATEGORY_GRADIENT = [
  "#4f46e5", "#5b5bd6", "#6366f1", "#7c7cf8", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload[0]?.payload?.total;
  const pct = total ? ((payload[0].value / total) * 100).toFixed(0) : null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-800">{payload[0].name || label}</p>
      <p className="text-gray-600">
        {payload[0].value} {pct ? `(${pct}%)` : ""}
      </p>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function BreakdownCharts({ stats }: Props) {
  const { t, locale } = useI18n();

  const totalUrgency = Object.values(stats.urgency_breakdown).reduce((a, b) => a + b, 0);
  const urgencyData = Object.entries(stats.urgency_breakdown).map(
    ([name, value]) => ({
      name: t(`urgency.${name}` as any),
      value,
      key: name,
      total: totalUrgency,
    }),
  );

  const categoryData = Object.entries(stats.category_breakdown)
    .map(([name, value]) => ({
      name: t(`cat.${name}` as any),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const totalDialect = Object.values(stats.dialect_breakdown).reduce((a, b) => a + b, 0);
  const dialectData = Object.entries(stats.dialect_breakdown)
    .map(([name, value]) => ({
      name: t(`dialect.${name}` as any),
      value,
      total: totalDialect,
    }))
    .sort((a, b) => b.value - a.value);

  const isEmpty =
    urgencyData.length === 0 &&
    categoryData.length === 0 &&
    dialectData.length === 0;

  if (isEmpty) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-gray-400 text-sm">{t("chart.noAnalysis")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Urgency Donut */}
      <div
        data-tutorial="urgency-chart"
        className="glass-card rounded-2xl p-6 animate-scale-in"
        style={{ animationDelay: "0ms" }}
      >
        <h3 className="text-sm font-bold text-gray-800">
          {t("chart.urgencyBreakdown")}
        </h3>
        <InsightCard descriptionKey="insight.urgencyBreakdownDesc" variant="panel" />

        {urgencyData.length > 0 ? (
          <div className="relative mt-3">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={urgencyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  label={(props: PieLabelRenderProps) =>
                    `${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {urgencyData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={URGENCY_COLORS[entry.key] || "#94a3b8"}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{totalUrgency}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("reviews.total" as any)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">{t("chart.noData")}</p>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2">
          {urgencyData.map((entry) => (
            <div key={entry.key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: URGENCY_COLORS[entry.key] }}
              />
              {entry.name}
            </div>
          ))}
        </div>
      </div>

      {/* Category Bar */}
      <div
        data-tutorial="category-chart"
        className="glass-card rounded-2xl p-6 animate-scale-in"
        style={{ animationDelay: "100ms" }}
      >
        <h3 className="text-sm font-bold text-gray-800">
          {t("chart.categories")}
        </h3>
        <InsightCard descriptionKey="insight.categoriesDesc" variant="panel" />

        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220} className="mt-3">
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ left: locale === "ar" ? 0 : 10, right: locale === "ar" ? 10 : 0 }}
            >
              <XAxis type="number" allowDecimals={false} fontSize={11} stroke="#cbd5e1" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                fontSize={11}
                tick={{ fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                {categoryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CATEGORY_GRADIENT[i % CATEGORY_GRADIENT.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">{t("chart.noData")}</p>
        )}
      </div>

      {/* Dialect Donut */}
      <div
        data-tutorial="dialect-chart"
        className="glass-card rounded-2xl p-6 animate-scale-in"
        style={{ animationDelay: "200ms" }}
      >
        <h3 className="text-sm font-bold text-gray-800">
          {t("chart.dialectDistribution")}
        </h3>
        <InsightCard descriptionKey="insight.dialectDistributionDesc" variant="panel" />

        {dialectData.length > 0 ? (
          <div className="relative mt-3">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dialectData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  label={(props: PieLabelRenderProps) =>
                    `${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {dialectData.map((_, i) => (
                    <Cell key={i} fill={DIALECT_COLORS[i % DIALECT_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{totalDialect}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("reviews.total" as any)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">{t("chart.noData")}</p>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {dialectData.map((entry, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: DIALECT_COLORS[i % DIALECT_COLORS.length] }}
              />
              {entry.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
