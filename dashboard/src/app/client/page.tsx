"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { I18nProvider, useI18n } from "@/lib/i18n";
import {
  getRole,
  getProfile,
  isLoggedIn,
  logout,
  confirmPlaceId,
  createCheckout,
} from "@/lib/auth";
import { UserProfile, InvoiceInfo } from "@/lib/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DashboardShell from "@/components/DashboardShell";
import {
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  MapPin,
  Key,
  Copy,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const HYPERPAY_SCRIPT_URL =
  process.env.NEXT_PUBLIC_HYPERPAY_SCRIPT_URL ||
  "https://eu-test.oppwa.com/v1/paymentWidgets.js";

function ClientDashboard() {
  const { t, dir, locale } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [placeId, setPlaceId] = useState("");
  const [placeLoading, setPlaceLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Payment state
  const [payLoading, setPayLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const paymentFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    if (getRole() === "admin") {
      router.push("/admin/registrations");
      return;
    }
    loadProfile();
  }, [router]);

  // Load HyperPay widget script when checkoutId is set
  useEffect(() => {
    if (!checkoutId) return;

    // Remove any existing HyperPay scripts
    const existingScripts = document.querySelectorAll(
      'script[src*="paymentWidgets"]'
    );
    existingScripts.forEach((s) => s.remove());

    const script = document.createElement("script");
    script.src = `${HYPERPAY_SCRIPT_URL}?checkoutId=${checkoutId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [checkoutId]);

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    // Find the pending invoice
    const pendingInvoice = profile?.invoices?.find(
      (inv: InvoiceInfo) => inv.status === "pending"
    );
    if (!pendingInvoice) {
      setPayError("No pending invoice found");
      return;
    }

    setPayLoading(true);
    setPayError(null);
    try {
      const result = await createCheckout(pendingInvoice.id);
      setCheckoutId(result.checkout_id);
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  const handleConfirmPlace = async () => {
    if (!placeId.trim()) return;
    setPlaceLoading(true);
    try {
      await confirmPlaceId(placeId.trim());
      setPlaceId("");
      await loadProfile();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPlaceLoading(false);
    }
  };

  const copyKey = () => {
    if (profile?.tenant?.api_key) {
      navigator.clipboard.writeText(profile.tenant.api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const tenant = profile?.tenant;
  const status = tenant?.status;
  const pendingInvoice = profile?.invoices?.find(
    (inv: InvoiceInfo) => inv.status === "pending"
  );

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white font-bold text-lg w-10 h-10 rounded-lg flex items-center justify-center">
              D
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {tenant?.name_ar || "DialectIQ"}
              </h1>
              <p className="text-xs text-gray-500">
                {t(`package.${tenant?.package}` as any)} &bull;{" "}
                {t(`tenant.${status}` as any)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("admin.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status: Pending Review */}
        {status === "pending_review" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {t("client.underReview")}
            </h2>
            <p className="text-sm text-gray-600">
              {t("client.underReviewDesc")}
            </p>
          </div>
        )}

        {/* Status: Rejected */}
        {status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {t("client.rejected")}
            </h2>
            <p className="text-sm text-gray-600">
              {tenant?.rejection_reason || t("client.rejectedDesc")}
            </p>
          </div>
        )}

        {/* Status: Approved (need payment) */}
        {status === "approved" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 text-center text-white">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <h2 className="text-xl font-bold mb-1">
                {t("client.paymentRequired")}
              </h2>
              <p className="text-sm text-indigo-100">
                {t("payment.completePayment")}
              </p>
            </div>

            <div className="p-8">
              {/* Invoice details */}
              {pendingInvoice && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("payment.invoiceAmount")}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {pendingInvoice.amount_sar.toLocaleString()}{" "}
                    <span className="text-lg font-normal text-gray-500">
                      {t("register.sarMonth")}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {t(`package.${tenant?.package}` as any)}
                  </p>
                </div>
              )}

              {/* Error */}
              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
                  <p className="text-sm text-red-600">{payError}</p>
                </div>
              )}

              {/* HyperPay widget OR Pay button */}
              {checkoutId ? (
                <div ref={paymentFormRef}>
                  <form
                    action="/client/payment-result"
                    className="paymentWidgets"
                    data-brands="VISA MASTER MADA"
                  />
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <ShieldCheck className="w-4 h-4" />
                    {t("payment.securePayment")}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePayNow}
                  disabled={payLoading || !pendingInvoice}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {payLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("payment.processing")}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {t("payment.payNow")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status: Active */}
        {status === "active" && (
          <>
            {/* API Key card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-800">
                    {t("client.apiKey")}
                  </h3>
                </div>
                {tenant?.api_key && (
                  <button
                    onClick={copyKey}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedKey ? t("admin.copied") : t("client.copy")}
                  </button>
                )}
              </div>
              <div className="mt-2 font-mono text-sm bg-gray-50 rounded-lg p-3 text-gray-700">
                {tenant?.api_key || "—"}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {t("client.reviewsUsed")}: {tenant?.reviews_used_this_month} /{" "}
                {tenant?.max_reviews_per_month}
              </p>
            </div>

            {/* Place ID management */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800">
                  {t("client.placeIds")}
                </h3>
              </div>

              {/* Existing place IDs */}
              {tenant?.place_ids && tenant.place_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tenant.place_ids.map((pid) => (
                    <span
                      key={pid}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-mono"
                    >
                      <CheckCircle className="w-3 h-3 inline me-1" />
                      {pid}
                    </span>
                  ))}
                </div>
              )}

              {/* Add new */}
              <div className="flex gap-2">
                <input
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  placeholder={t("client.placeIdPlaceholder")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  dir="ltr"
                />
                <button
                  onClick={handleConfirmPlace}
                  disabled={!placeId.trim() || placeLoading}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {placeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {t("client.addPlaceId")}
                </button>
              </div>
            </div>

            {/* Dashboard */}
            <DashboardShell />
          </>
        )}
      </main>
    </div>
  );
}

export default function ClientPage() {
  return (
    <I18nProvider>
      <ClientDashboard />
    </I18nProvider>
  );
}
