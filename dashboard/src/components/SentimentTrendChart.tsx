"use client";

import { DashboardStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  stats: DashboardStats;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-xs shadow-lg z-50">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-800">
        {payload[0].value.toFixed(1)}/10
      </p>
      <p className="text-gray-400">
        {payload[0].payload.count} reviews
      </p>
    </div>
  );
}

export default function SentimentTrendChart({ stats }: Props) {
  const { t } = useI18n();
  const data = stats.sentiment_trend || [];

  if (data.length < 2) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-gray-400 text-sm">
          {t("trend.noData" as any)}
        </p>
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1, 10]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<TrendTooltip />} />
            <Line
              type="monotone"
              dataKey="avg_sentiment"
              stroke="#00D2DF"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#00D2DF", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#00D2DF", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
