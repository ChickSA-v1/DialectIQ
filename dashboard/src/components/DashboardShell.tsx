"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardResponse, Filters } from "@/lib/types";
import { fetchDashboard } from "@/lib/api";
import StatsCards from "./StatsCards";
import BreakdownCharts from "./BreakdownCharts";
import FilterBar from "./FilterBar";
import ReviewCard from "./ReviewCard";
import Pagination from "./Pagination";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function DashboardShell() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboard(filters, page);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilters = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <FilterBar filters={filters} onApply={handleFilters} />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 font-medium">
              Failed to load dashboard
            </p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={load}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {data && (
        <>
          <StatsCards stats={data.stats} />
          <BreakdownCharts stats={data.stats} />

          {/* Reviews section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Reviews
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({data.stats.total_reviews} total)
                </span>
              </h2>
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {data.reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                  No reviews found. Adjust your filters or send reviews through
                  the API.
                </p>
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
