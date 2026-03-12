"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "ar";

const translations = {
  en: {
    // Header
    "app.title": "DialectIQ",
    "app.subtitle": "Saudi dialect-aware sentiment analysis",

    // Stats Cards
    "stats.totalReviews": "Total Reviews",
    "stats.avgSentiment": "Avg Sentiment",
    "stats.avgRating": "Avg Rating",
    "stats.highUrgency": "High Urgency",

    // Filter Bar
    "filter.businessName": "Business Name",
    "filter.searchPlaceholder": "Search businesses...",
    "filter.category": "Category",
    "filter.allCategories": "All Categories",
    "filter.urgency": "Urgency",
    "filter.allUrgencies": "All Urgencies",
    "filter.search": "Search",
    "filter.clear": "Clear",

    // Categories
    "cat.Pricing": "Pricing",
    "cat.Quality": "Quality",
    "cat.Customer Service": "Customer Service",
    "cat.Delivery": "Delivery",
    "cat.UX": "UX",
    "cat.Trust & Safety": "Trust & Safety",
    "cat.General": "General",
    "cat.User Experience": "User Experience",

    // Urgencies
    "urgency.High": "High",
    "urgency.Medium": "Medium",
    "urgency.Low": "Low",

    // Charts
    "chart.urgencyBreakdown": "Urgency Breakdown",
    "chart.categories": "Categories",
    "chart.dialectDistribution": "Dialect Distribution",
    "chart.noData": "No data",
    "chart.noAnalysis": "No analysis data yet. Send reviews through the API to see charts.",

    // Reviews section
    "reviews.title": "Reviews",
    "reviews.total": "total",
    "reviews.refresh": "Refresh",
    "reviews.noResults": "No reviews found. Adjust your filters or send reviews through the API.",
    "reviews.anonymous": "Anonymous",
    "reviews.showDetails": "Show intent & reply",
    "reviews.hideDetails": "Hide details",
    "reviews.translatedIntent": "Translated Intent",
    "reviews.suggestedReply": "Suggested Reply",

    // Pagination
    "pagination.page": "Page",
    "pagination.of": "of",

    // Error / Loading
    "error.title": "Failed to load dashboard",
    "error.retry": "Retry",
    "error.fallback": "Failed to load data",

    // Language
    "lang.switch": "العربية",

    // Dialects
    "dialect.Najdi": "Najdi",
    "dialect.Hijazi": "Hijazi",
    "dialect.Sharqi": "Sharqi",
    "dialect.MSA": "MSA",
    "dialect.Arabizi": "Arabizi",
    "dialect.Mixed": "Mixed",
  },
  ar: {
    // Header
    "app.title": "DialectIQ",
    "app.subtitle": "تحليل المشاعر بالهجات السعودية",

    // Stats Cards
    "stats.totalReviews": "إجمالي التقييمات",
    "stats.avgSentiment": "متوسط المشاعر",
    "stats.avgRating": "متوسط التقييم",
    "stats.highUrgency": "أولوية عالية",

    // Filter Bar
    "filter.businessName": "اسم المنشأة",
    "filter.searchPlaceholder": "ابحث عن منشأة...",
    "filter.category": "التصنيف",
    "filter.allCategories": "جميع التصنيفات",
    "filter.urgency": "الأولوية",
    "filter.allUrgencies": "جميع الأولويات",
    "filter.search": "بحث",
    "filter.clear": "مسح",

    // Categories
    "cat.Pricing": "التسعير",
    "cat.Quality": "الجودة",
    "cat.Customer Service": "خدمة العملاء",
    "cat.Delivery": "التوصيل",
    "cat.UX": "تجربة المستخدم",
    "cat.Trust & Safety": "الثقة والأمان",
    "cat.General": "عام",
    "cat.User Experience": "تجربة المستخدم",

    // Urgencies
    "urgency.High": "عالية",
    "urgency.Medium": "متوسطة",
    "urgency.Low": "منخفضة",

    // Charts
    "chart.urgencyBreakdown": "توزيع الأولويات",
    "chart.categories": "التصنيفات",
    "chart.dialectDistribution": "توزيع اللهجات",
    "chart.noData": "لا توجد بيانات",
    "chart.noAnalysis": "لا توجد بيانات تحليلية بعد. أرسل تقييمات عبر الـ API لرؤية الرسوم البيانية.",

    // Reviews section
    "reviews.title": "التقييمات",
    "reviews.total": "إجمالي",
    "reviews.refresh": "تحديث",
    "reviews.noResults": "لا توجد تقييمات. عدّل الفلاتر أو أرسل تقييمات عبر الـ API.",
    "reviews.anonymous": "مجهول",
    "reviews.showDetails": "عرض التحليل والرد",
    "reviews.hideDetails": "إخفاء التفاصيل",
    "reviews.translatedIntent": "ترجمة المعنى",
    "reviews.suggestedReply": "الرد المقترح",

    // Pagination
    "pagination.page": "صفحة",
    "pagination.of": "من",

    // Error / Loading
    "error.title": "فشل تحميل لوحة المعلومات",
    "error.retry": "إعادة المحاولة",
    "error.fallback": "فشل تحميل البيانات",

    // Language
    "lang.switch": "English",

    // Dialects
    "dialect.Najdi": "نجدي",
    "dialect.Hijazi": "حجازي",
    "dialect.Sharqi": "شرقي",
    "dialect.MSA": "فصحى",
    "dialect.Arabizi": "عربيزي",
    "dialect.Mixed": "مختلط",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("dialectiq-lang") as Locale) || "en";
    }
    return "en";
  });

  const dir = locale === "ar" ? "rtl" : "ltr";

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? key;
    },
    [locale],
  );

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("dialectiq-lang", newLocale);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
