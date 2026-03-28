"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { getRole, isLoggedIn, logout, fetchAdminDashboardStats } from "@/lib/auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Receipt,
  Landmark,
  BarChart3,
  LogOut,
  Shield,
} from "lucide-react";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, dir, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({
    registrations: 0,
    bankTransfers: 0,
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  useEffect(() => {
    if (!isLoggedIn() || getRole() !== "admin") {
      router.push("/login");
      return;
    }
    setReady(true);
    // Fetch pending counts for badges
    fetchAdminDashboardStats()
      .then((stats) => {
        setPendingCounts({
          registrations: stats.pending_registrations,
          bankTransfers: stats.pending_bank_transfers,
        });
      })
      .catch(() => {});
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">{t("admin.loading")}</div>
      </div>
    );
  }

  const navItems = [
    {
      href: "/admin",
      label: t("admin.dashboard" as any),
      icon: LayoutDashboard,
      badge: 0,
    },
    {
      href: "/admin/registrations",
      label: t("admin.registrations"),
      icon: ClipboardList,
      badge: pendingCounts.registrations,
    },
    {
      href: "/admin/tenants",
      label: t("admin.tenants"),
      icon: Building2,
      badge: 0,
    },
    {
      href: "/admin/invoices",
      label: t("admin.invoices" as any),
      icon: Receipt,
      badge: 0,
    },
    {
      href: "/admin/bank-transfers",
      label: t("admin.bankTransfers" as any),
      icon: Landmark,
      badge: pendingCounts.bankTransfers,
    },
    {
      href: "/admin/reports",
      label: t("admin.reports" as any),
      icon: BarChart3,
      badge: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-e border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="DialectIQ"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <h2 className="font-bold text-gray-900 text-sm">DialectIQ</h2>
              <div className="flex items-center gap-1 text-xs text-cyan-600">
                <Shield className="w-3 h-3" />
                {t("admin.panel")}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-2">
          <LanguageSwitcher />
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <AdminShell>{children}</AdminShell>
    </I18nProvider>
  );
}
