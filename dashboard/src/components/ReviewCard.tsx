"use client";

import { ReviewDetail } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import {
  sentimentColor,
  urgencyBadge,
  formatDate,
} from "@/lib/utils";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Star,
  Tag,
  Globe,
  Copy,
  Check,
  Calendar,
} from "lucide-react";
import { useState } from "react";

interface Props {
  review: ReviewDetail;
}

export default function ReviewCard({ review }: Props) {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [replyCopied, setReplyCopied] = useState(false);
  const ub = urgencyBadge(review.urgency_level);

  const sentimentPct = review.sentiment_score != null ? (review.sentiment_score / 10) * 100 : 0;

  const handleCopyReply = async () => {
    if (!review.suggested_reply) return;
    try {
      await navigator.clipboard.writeText(review.suggested_reply);
      setReplyCopied(true);
      setTimeout(() => setReplyCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden">
      {/* Sentiment gradient bar */}
      <div className="relative h-1 bg-gray-100">
        <div
          className="absolute inset-y-0 start-0"
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 40%, #10b981 100%)",
            opacity: 0.3,
          }}
        />
        {review.sentiment_score != null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 shadow-sm z-10"
            style={{
              left: `${sentimentPct}%`,
              borderColor:
                review.sentiment_score >= 7
                  ? "#10b981"
                  : review.sentiment_score >= 4
                    ? "#f59e0b"
                    : "#ef4444",
            }}
          />
        )}
      </div>

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">
                {review.author ?? t("reviews.anonymous")}
              </span>
              {/* Star rating */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= (review.rating ?? 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              {review.urgency_level && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ub.bg} ${ub.text} ${
                    review.urgency_level === "High" ? "animate-pulse-soft" : ""
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ub.dot}`} />
                  {t(`urgency.${review.urgency_level}` as any)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
              <span>{review.business_name}</span>
              <span>•</span>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(review.created_at, locale)}</span>
            </div>
          </div>
          {review.sentiment_score != null && (
            <div className="text-center">
              <div
                className={`text-2xl font-extrabold tracking-tight ${sentimentColor(review.sentiment_score)}`}
              >
                {review.sentiment_score}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">/10</div>
            </div>
          )}
        </div>

        {/* Review text */}
        <p className="mt-3 text-gray-700 text-sm leading-relaxed" dir="auto">
          {review.raw_text}
        </p>

        {/* Analysis chips */}
        {(review.category || review.dialect_detected) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {review.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium border border-cyan-100">
                <Tag className="w-3 h-3" />
                {t(`cat.${review.category}` as any)}
              </span>
            )}
            {review.dialect_detected && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                <Globe className="w-3 h-3" />
                {t(`dialect.${review.dialect_detected}` as any)}
              </span>
            )}
            {review.source && (
              <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full text-xs border border-gray-100">
                {review.source}
              </span>
            )}
          </div>
        )}

        {/* Expandable section */}
        {(review.translated_intent || review.suggested_reply) && (
          <div className="mt-3 pt-3 border-t border-gray-100/50">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {expanded ? t("reviews.hideDetails") : t("reviews.showDetails")}
            </button>

            {expanded && (
              <div className="mt-3 space-y-3 animate-slide-down">
                {review.translated_intent && (
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/50">
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">
                      {t("reviews.translatedIntent")}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.translated_intent}
                    </p>
                  </div>
                )}
                {review.suggested_reply && (
                  <div className="bg-cyan-50/60 rounded-xl p-4 border border-cyan-100/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                        <p className="text-xs font-semibold text-cyan-600">
                          {t("reviews.suggestedReply")}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyReply}
                        className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-700 transition-colors"
                      >
                        {replyCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            {t("review.replyCopied" as any)}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            {t("review.copyReply" as any)}
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed" dir="rtl">
                      {review.suggested_reply}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
