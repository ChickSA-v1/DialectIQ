"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  CompetitorComparison as CompData,
  CompetitorInfo,
  fetchCompetitorComparison,
  addCompetitor,
  removeCompetitor,
} from "@/lib/api";
import { searchPlaces } from "@/lib/auth";
import { PlaceSearchResult } from "@/lib/types";
import { Plus, Trash2, Star, TrendingUp, TrendingDown, Search, X, Loader2 } from "lucide-react";

export default function CompetitorComparisonSection() {
  const { t } = useI18n();
  const [data, setData] = useState<CompData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchCompetitorComparison();
      setData(res);
    } catch {
      // silent — section is optional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await searchPlaces(searchQuery);
      setSearchResults(res.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (place_id: string) => {
    setAdding(true);
    try {
      await addCompetitor(place_id);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add competitor");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (place_id: string) => {
    try {
      await removeCompetitor(place_id);
      await load();
    } catch {}
  };

  if (loading) {
    return <div className="shimmer-bg rounded-2xl h-40" />;
  }

  const own = data?.own || [];
  const competitors = data?.competitors || [];

  // Calculate own average rating
  const ownAvgRating = own.length > 0
    ? own.reduce((sum, o) => sum + (o.rating || 0), 0) / own.length
    : null;

  return (
    <div className="space-y-4">
      {/* Own vs Competitors cards */}
      {(own.length > 0 || competitors.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Own Businesses */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              {t("competitor.your" as any)}
            </h4>
            <div className="space-y-3">
              {own.map((b) => (
                <PlaceCard key={b.place_id} place={b} />
              ))}
            </div>
          </div>

          {/* Competitors */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {t("competitor.rivals" as any)}
              </h4>
              {competitors.length < 3 && (
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {t("competitor.add" as any)}
                </button>
              )}
            </div>
            {competitors.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">{t("competitor.empty" as any)}</p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="px-4 py-2 text-sm gradient-primary text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  {t("competitor.addFirst" as any)}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {competitors.map((b) => (
                  <div key={b.place_id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <PlaceCard place={b} showDelta={ownAvgRating} />
                    </div>
                    <button
                      onClick={() => handleRemove(b.place_id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search panel */}
      {showSearch && (
        <div className="glass-card rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-bold text-gray-700 flex-1">{t("competitor.search" as any)}</h4>
            <button onClick={() => { setShowSearch(false); setSearchResults([]); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("competitor.searchPlaceholder" as any)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 text-sm gradient-primary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((r) => (
                <div key={r.place_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.address}</p>
                    {r.rating && (
                      <span className="text-xs text-amber-600 flex items-center gap-0.5 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {r.rating} ({r.user_ratings_total})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdd(r.place_id)}
                    disabled={adding}
                    className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors disabled:opacity-50"
                  >
                    {adding ? "..." : t("competitor.addBtn" as any)}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no own businesses */}
      {own.length === 0 && competitors.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm">{t("competitor.noBusinesses" as any)}</p>
        </div>
      )}
    </div>
  );
}

function PlaceCard({ place, showDelta }: { place: CompetitorInfo; showDelta?: number | null }) {
  const delta = showDelta != null && place.rating != null ? place.rating - showDelta : null;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-gray-800">{place.name}</p>
        <div className="flex items-center gap-3 mt-1">
          {place.rating != null && (
            <span className="text-xs text-amber-600 flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {place.rating}
            </span>
          )}
          {place.review_count != null && (
            <span className="text-xs text-gray-400">{place.review_count} reviews</span>
          )}
          {place.avg_sentiment != null && (
            <span className="text-xs text-cyan-600 font-medium">{place.avg_sentiment}/10 sentiment</span>
          )}
        </div>
      </div>
      {delta != null && (
        <div className={`flex items-center gap-1 text-xs font-bold ${delta > 0 ? "text-rose-500" : delta < 0 ? "text-emerald-500" : "text-gray-400"}`}>
          {delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
        </div>
      )}
    </div>
  );
}
