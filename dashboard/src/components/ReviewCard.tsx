"use client";

import { ReviewDetail } from "@/lib/types";
import {
  sentimentColor,
  sentimentBg,
  urgencyBadge,
  ratingStars,
  formatDate,
} from "@/lib/utils";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Props {
  review: ReviewDetail;
}

export default function ReviewCard({ review }: Props) {
  const [expanded, setExpanded] = useState(false);
  const ub = urgencyBadge(review.urgency_level);

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${sentimentBg(review.sentiment_score)}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">
              {review.author ?? "Anonymous"}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-amber-500 text-sm">
              {ratingStars(review.rating)}
            </span>
            {review.urgency_level && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ub.bg} ${ub.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ub.dot}`} />
                {review.urgency_level}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {review.business_name} • {formatDate(review.created_at)}
          </p>
        </div>
        {review.sentiment_score !== null && (
          <div
            className={`text-xl font-bold ${sentimentColor(review.sentiment_score)}`}
          >
            {review.sentiment_score}
            <span className="text-xs font-normal text-gray-400">/10</span>
          </div>
        )}
      </div>

      {/* Review text */}
      <p
        className="mt-3 text-gray-700 text-sm leading-relaxed"
        dir="auto"
      >
        {review.raw_text}
      </p>

      {/* Analysis chips */}
      {(review.category || review.dialect_detected) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {review.category && (
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
              {review.category}
            </span>
          )}
          {review.dialect_detected && (
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
              {review.dialect_detected}
            </span>
          )}
          {review.source && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {review.source}
            </span>
          )}
        </div>
      )}

      {/* Expandable section: translated intent + suggested reply */}
      {(review.translated_intent || review.suggested_reply) && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {expanded ? "Hide details" : "Show intent & reply"}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2">
              {review.translated_intent && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Translated Intent
                  </p>
                  <p className="text-sm text-gray-700">
                    {review.translated_intent}
                  </p>
                </div>
              )}
              {review.suggested_reply && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <MessageSquare className="w-3 h-3 text-indigo-600" />
                    <p className="text-xs font-semibold text-indigo-600">
                      Suggested Reply
                    </p>
                  </div>
                  <p
                    className="text-sm text-gray-700 leading-relaxed"
                    dir="rtl"
                  >
                    {review.suggested_reply}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
