"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { searchPlaces, confirmPlaceId } from "@/lib/auth";
import { PlaceSearchResult } from "@/lib/types";
import {
  Search,
  MapPin,
  Star,
  Loader2,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface BusinessSearchProps {
  currentPlaceIds: string[];
  maxBusinesses: number;
  onPlaceAdded: () => void;
}

export default function BusinessSearch({
  currentPlaceIds,
  maxBusinesses,
  onPlaceAdded,
}: BusinessSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const atLimit = currentPlaceIds.length >= maxBusinesses;

  const handleSearch = async () => {
    if (!query.trim() || atLimit) return;
    setSearching(true);
    setError(null);
    setSuccess(null);
    setResults([]);
    setSearched(true);
    try {
      const response = await searchPlaces(query.trim());
      setResults(response.results);
      if (response.results.length === 0) {
        setError(t("client.noResults" as any));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (result: PlaceSearchResult) => {
    if (currentPlaceIds.includes(result.place_id)) return;
    setConfirming(result.place_id);
    setError(null);
    try {
      await confirmPlaceId(result.place_id);
      setSuccess(t("client.placeIdAdded" as any));
      setResults([]);
      setQuery("");
      setSearched(false);
      onPlaceAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirming(null);
    }
  };

  // Limit warning
  if (atLimit) {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {t("client.businessLimit" as any)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input + button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder={t("client.searchPlaceholder" as any)}
            className="w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            dir="auto"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || searching}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shrink-0"
        >
          {searching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("client.searching" as any)}
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              {t("filter.search" as any)}
            </>
          )}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => {
            const isAdded = currentPlaceIds.includes(result.place_id);
            return (
              <div
                key={result.place_id}
                className="flex items-start justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {result.name}
                    </h4>
                    {result.maps_url && (
                      <a
                        href={result.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-indigo-500 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {result.address && (
                    <p className="text-xs text-gray-500 mb-1.5 truncate">
                      {result.address}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {result.rating && (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {result.rating.toFixed(1)}
                      </span>
                    )}
                    {result.user_ratings_total != null && (
                      <span className="text-xs text-gray-400">
                        ({result.user_ratings_total.toLocaleString()}{" "}
                        {t("client.reviews" as any)})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSelect(result)}
                  disabled={isAdded || confirming === result.place_id}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isAdded
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  }`}
                >
                  {confirming === result.place_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isAdded ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t("client.alreadyAdded" as any)}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      {t("client.selectBusiness" as any)}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* No results after search */}
      {searched && !searching && results.length === 0 && !error && (
        <p className="text-center text-sm text-gray-400 py-4">
          {t("client.noResults" as any)}
        </p>
      )}
    </div>
  );
}
