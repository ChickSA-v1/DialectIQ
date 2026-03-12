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
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        {/* Business name search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("filter.businessName")}
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  onApply({ ...filters, business_name: business || undefined });
              }}
              placeholder={t("filter.searchPlaceholder")}
              className="w-full ps-9 pe-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category dropdown */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("filter.category")}
          </label>
          <select
            value={filters.category ?? ""}
            onChange={(e) =>
              onApply({ ...filters, category: e.target.value || undefined })
            }
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("filter.urgency")}
          </label>
          <select
            value={filters.urgency ?? ""}
            onChange={(e) =>
              onApply({ ...filters, urgency: e.target.value || undefined })
            }
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
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
            className="px-3 py-2 text-gray-500 hover:text-gray-700 rounded-lg text-sm flex items-center gap-1 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <X className="w-3 h-3" />
            {t("filter.clear")}
          </button>
        )}
      </div>
    </div>
  );
}
