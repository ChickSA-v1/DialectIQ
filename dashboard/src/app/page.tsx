"use client";

import { I18nProvider, useI18n } from "@/lib/i18n";
import DashboardShell from "@/components/DashboardShell";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect } from "react";

function DashboardPage() {
  const { t, dir, locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={dir}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white font-bold text-lg w-10 h-10 rounded-lg flex items-center justify-center">
              D
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("app.title")}
              </h1>
              <p className="text-sm text-gray-500">{t("app.subtitle")}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <DashboardShell />
    </main>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <DashboardPage />
    </I18nProvider>
  );
}
