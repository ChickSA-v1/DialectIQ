"use client";

import { DashboardStats } from "@/lib/types";
import {
  MessageSquareText,
  TrendingUp,
  Star,
  AlertTriangle,
} from "lucide-react";

interface Props {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: Props) {
  const highUrgency = stats.urgency_breakdown["High"] ?? 0;

  const cards = [
    {
      label: "Total Reviews",
      value: stats.total_reviews.toLocaleString(),
      icon: MessageSquareText,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Avg Sentiment",
      value: stats.avg_sentiment !== null ? `${stats.avg_sentiment}/10` : "—",
      icon: TrendingUp,
      color:
        stats.avg_sentiment && stats.avg_sentiment >= 7
          ? "text-emerald-600"
          : stats.avg_sentiment && stats.avg_sentiment >= 4
            ? "text-amber-600"
            : "text-red-600",
      bg:
        stats.avg_sentiment && stats.avg_sentiment >= 7
          ? "bg-emerald-50"
          : stats.avg_sentiment && stats.avg_sentiment >= 4
            ? "bg-amber-50"
            : "bg-red-50",
    },
    {
      label: "Avg Rating",
      value:
        stats.avg_rating !== null
          ? `${stats.avg_rating} ★`
          : "—",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "High Urgency",
      value: highUrgency.toString(),
      icon: AlertTriangle,
      color: highUrgency > 0 ? "text-red-600" : "text-emerald-600",
      bg: highUrgency > 0 ? "bg-red-50" : "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
            <div className={`${c.bg} p-3 rounded-lg`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
