"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardResponse, Filters } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { fetchDashboard, exportCSV } from "@/lib/api";
import StatsCards from "./StatsCards";
import BreakdownCharts from "./BreakdownCharts";
import FilterBar from "./FilterBar";
import ReviewCard from "./ReviewCard";
import SentimentTrendChart from "./SentimentTrendChart";
import CompetitorComparison from "./CompetitorComparison";
import Pagination from "./Pagination";
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  MessageSquare,
  LayoutDashboard,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";

function SectionHeader({
  icon: Icon,
  titleKey,
  badge,
}: {
  icon: React.ElementType;
  titleKey: string;
  badge?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-cyan-50">
        <Icon className="w-4 h-4 text-cyan-500" />
      </div>
      <h2 className="text-base font-bold text-gray-800">
        {t(titleKey as any)}
      </h2>
      {badge && (
        <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold">
          {badge}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-cyan-200/60 to-transparent" />
    </div>
  );
}

function ShimmerBlock({ className }: { className: string }) {
  return <div className={`shimmer-bg rounded-2xl ${className}`} />;
}

export default function DashboardShell() {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboard(filters, page);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.fallback"));
    } finally {
      setLoading(false);
    }
  }, [filters, page, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilters = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Error state */}
      {error && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border-red-200/50 bg-red-50/50">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 font-semibold">{t("error.title")}</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={load}
            className="px-4 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            {t("error.retry")}
          </button>
        </div>
      )}

      {/* Loading skeleton with shimmer */}
      {loading && !data && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter skeleton */}
          <ShimmerBlock className="h-16" />
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <ShimmerBlock key={i} className="h-28" />
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <ShimmerBlock key={i} className="h-72" />
            ))}
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {data && (
        <>
          {/* Filters */}
          <FilterBar filters={filters} onApply={handleFilters} />

          {/* Overview section */}
          <SectionHeader icon={LayoutDashboard} titleKey="section.overview" />
          <StatsCards stats={data.stats} />

          {/* Analytics section */}
          <SectionHeader icon={BarChart3} titleKey="section.analytics" />
          <BreakdownCharts stats={data.stats} />

          {/* Sentiment Trend */}
          <div data-tutorial="sentiment-trend">
            <SectionHeader icon={TrendingUp} titleKey={"section.sentimentTrend" as any} />
            <SentimentTrendChart stats={data.stats} />
          </div>

          {/* Competitor Comparison */}
          <div data-tutorial="competitors">
            <SectionHeader icon={Users} titleKey={"section.competitors" as any} />
            <CompetitorComparison />
          </div>

          {/* Reviews section */}
          <div data-tutorial="reviews-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader
                icon={MessageSquare}
                titleKey="section.reviews"
                badge={`${data.stats.total_reviews}`}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setExporting(true);
                    try { await exportCSV(filters); } catch {} finally { setExporting(false); }
                  }}
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 glass-card rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 ${exporting ? "animate-pulse" : ""}`} />
                  {t("reviews.export" as any)}
                </button>
                <button
                  onClick={load}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 glass-card rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  {t("reviews.refresh")}
                </button>
              </div>
            </div>

            {data.reviews.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">{t("reviews.noResults")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}

            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
