"use client";

import { Filters } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface Props {
  filters: Filters;
  onApply: (f: Filters) => void;
}

const CATEGORIES = [
  "Pricing",
  "Quality",
  "Customer Service",
  "Delivery",
  "UX",
  "Trust & Safety",
  "General",
];

const URGENCIES = ["High", "Medium", "Low"];

export default function FilterBar({ filters, onApply }: Props) {
  const { t } = useI18n();
  const [business, setBusiness] = useState(filters.business_name ?? "");

  const hasFilters =
    filters.business_name || filters.category || filters.urgency;

  return (
    <div data-tutorial="filter-bar" className="glass-card rounded-2xl p-5">
      <div className="flex flex-wrap items-end gap-3">
        {/* Business name search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t("filter.businessName")}
          </label>
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  onApply({ ...filters, business_name: business || undefined });
              }}
              placeholder={t("filter.searchPlaceholder")}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Category dropdown */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t("filter.category")}
          </label>
          <select
            value={filters.category ?? ""}
            onChange={(e) =>
              onApply({ ...filters, category: e.target.value || undefined })
            }
            className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-sm bg-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
          >
            <option value="">{t("filter.allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`cat.${c}` as any)}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency dropdown */}
        <div className="min-w-[130px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {t("filter.urgency")}
          </label>
          <select
            value={filters.urgency ?? ""}
            onChange={(e) =>
              onApply({ ...filters, urgency: e.target.value || undefined })
            }
            className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-sm bg-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
          >
            <option value="">{t("filter.allUrgencies")}</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {t(`urgency.${u}` as any)}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          onClick={() =>
            onApply({ ...filters, business_name: business || undefined })
          }
          className="px-5 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
        >
          {t("filter.search")}
        </button>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => {
              setBusiness("");
              onApply({});
            }}
            className="px-3 py-2.5 text-gray-500 hover:text-gray-700 rounded-xl text-sm flex items-center gap-1.5 border border-gray-200 hover:bg-white/80 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            {t("filter.clear")}
          </button>
        )}
      </div>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100/50">
          {filters.business_name && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {filters.business_name}
              <button
                onClick={() => {
                  setBusiness("");
                  onApply({ ...filters, business_name: undefined });
                }}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
              {t(`cat.${filters.category}` as any)}
              <button
                onClick={() => onApply({ ...filters, category: undefined })}
                className="hover:text-violet-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.urgency && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
              {t(`urgency.${filters.urgency}` as any)}
              <button
                onClick={() => onApply({ ...filters, urgency: undefined })}
                className="hover:text-amber-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
