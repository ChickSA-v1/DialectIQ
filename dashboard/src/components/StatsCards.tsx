"use client";

import { DashboardStats } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useAnimatedNumber } from "@/lib/hooks";
import InsightCard from "./InsightCard";
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
  const { t } = useI18n();
  const highUrgency = stats.urgency_breakdown["High"] ?? 0;

  const animatedTotal = useAnimatedNumber(stats.total_reviews, 800, 0);
  const animatedSentiment = useAnimatedNumber(stats.avg_sentiment ?? 0, 800, 1);
  const animatedRating = useAnimatedNumber(stats.avg_rating ?? 0, 800, 1);
  const animatedUrgency = useAnimatedNumber(highUrgency, 600, 0);

  const sentimentVal = stats.avg_sentiment ?? 0;
  const sentimentColor =
    sentimentVal >= 7 ? "text-emerald-600" : sentimentVal >= 4 ? "text-amber-600" : "text-red-600";
  const sentimentGradient =
    sentimentVal >= 7 ? "gradient-stripe-emerald" : sentimentVal >= 4 ? "gradient-stripe-amber" : "gradient-stripe-rose";

  const cards = [
    {
      label: t("stats.totalReviews"),
      value: stats.total_reviews > 0 ? Number(animatedTotal).toLocaleString() : "0",
      insightKey: "insight.totalReviews",
      icon: MessageSquareText,
      color: "text-cyan-600",
      iconBg: "bg-gradient-to-br from-cyan-500 to-teal-500",
      stripe: "gradient-stripe-indigo",
    },
    {
      label: t("stats.avgSentiment"),
      value: stats.avg_sentiment !== null ? `${animatedSentiment}/10` : "—",
      insightKey: "insight.avgSentiment",
      icon: TrendingUp,
      color: sentimentColor,
      iconBg: sentimentVal >= 7 ? "bg-gradient-to-br from-emerald-500 to-teal-500" : sentimentVal >= 4 ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-red-500 to-rose-500",
      stripe: sentimentGradient,
      sentimentBar: stats.avg_sentiment,
    },
    {
      label: t("stats.avgRating"),
      value: stats.avg_rating !== null ? animatedRating : "—",
      insightKey: "insight.avgRating",
      icon: Star,
      color: "text-amber-600",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
      stripe: "gradient-stripe-amber",
      showStars: stats.avg_rating,
    },
    {
      label: t("stats.highUrgency"),
      value: animatedUrgency,
      insightKey: "insight.highUrgency",
      icon: AlertTriangle,
      color: highUrgency > 0 ? "text-red-600" : "text-emerald-600",
      iconBg: highUrgency > 0 ? "bg-gradient-to-br from-red-500 to-rose-500" : "bg-gradient-to-br from-emerald-500 to-teal-500",
      stripe: highUrgency > 0 ? "gradient-stripe-rose" : "gradient-stripe-emerald",
      pulse: highUrgency > 0,
    },
  ];

  return (
    <div data-tutorial="stats-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="glass-card glass-card-hover rounded-2xl overflow-hidden animate-slide-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Gradient accent stripe */}
          <div className={`h-1 ${c.stripe}`} />

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Label with insight tooltip */}
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-gray-500 font-medium">{c.label}</p>
                  <InsightCard
                    descriptionKey={c.insightKey}
                    variant="tooltip"
                  />
                </div>

                {/* Value */}
                <p className={`text-3xl font-extrabold tracking-tight mt-2 ${c.color}`}>
                  {c.value}
                </p>

                {/* Star visualization for rating */}
                {"showStars" in c && c.showStars != null && (
                  <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(c.showStars as number)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Sentiment indicator bar */}
                {"sentimentBar" in c && c.sentimentBar != null && (
                  <div className="relative mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="absolute inset-y-0 start-0 rounded-full"
                      style={{
                        width: `${((c.sentimentBar as number) / 10) * 100}%`,
                        background: `linear-gradient(90deg, #F43F5E, #FBBF24, #10B981)`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Icon circle */}
              <div className={`${c.iconBg} p-3.5 rounded-2xl shadow-lg ${c.pulse ? "animate-pulse-soft" : ""}`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
