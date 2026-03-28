"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { I18nProvider, useI18n } from "@/lib/i18n";
import {
  getRole,
  getProfile,
  isLoggedIn,
  logout,
  createCheckout,
  fetchReviews,
  uploadBankTransfer,
  downloadInvoicePdf,
} from "@/lib/auth";
import { UserProfile, InvoiceInfo, FetchReviewsResult } from "@/lib/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DashboardShell from "@/components/DashboardShell";
import TeamManagement from "@/components/TeamManagement";
import TutorialOverlay, { useTutorial } from "@/components/TutorialOverlay";
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
  RefreshCw,
  MessageSquareText,
  HelpCircle,
  Sparkles,
  Building2,
  Upload,
  FileCheck,
  CalendarDays,
  BarChart3,
  FileText,
  Download,
} from "lucide-react";

const HYPERPAY_SCRIPT_URL =
  process.env.NEXT_PUBLIC_HYPERPAY_SCRIPT_URL ||
  "https://eu-test.oppwa.com/v1/paymentWidgets.js";

function ClientDashboard() {
  const { t, dir, locale } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Tutorial
  const { isActive: tutorialActive, startTutorial, endTutorial } = useTutorial();

  // Fetch reviews state
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchResults, setFetchResults] = useState<FetchReviewsResult[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Payment state
  const [payLoading, setPayLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const paymentFormRef = useRef<HTMLDivElement>(null);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

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

  // Check if first visit for welcome banner
  useEffect(() => {
    if (typeof window === "undefined") return;
    const welcomed = localStorage.getItem("dialectiq-welcomed");
    if (!welcomed) setShowWelcome(true);
  }, []);

  // Load HyperPay widget script when checkoutId is set (skip for mock)
  useEffect(() => {
    if (!checkoutId || isMockPayment) return;

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
  }, [checkoutId, isMockPayment]);

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
    const payableInvoice = profile?.invoices?.find(
      (inv: InvoiceInfo) => inv.status === "pending" || inv.status === "failed"
    );
    if (!payableInvoice) {
      setPayError("No payable invoice found");
      return;
    }

    setPayLoading(true);
    setPayError(null);
    try {
      const result = await createCheckout(payableInvoice.id);
      setCheckoutId(result.checkout_id);
      setIsMockPayment(result.is_mock);
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  const handleBankTransferUpload = async () => {
    const payableInvoice = profile?.invoices?.find(
      (inv: InvoiceInfo) => inv.status === "pending" || inv.status === "failed"
    );
    if (!payableInvoice || !receiptFile) return;

    setUploadingReceipt(true);
    setPayError(null);
    try {
      await uploadBankTransfer(payableInvoice.id, receiptFile);
      setReceiptUploaded(true);
      setReceiptFile(null);
      // Reload profile to get updated invoice status
      loadProfile();
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const copyKey = () => {
    if (profile?.tenant?.api_key) {
      navigator.clipboard.writeText(profile.tenant.api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("dialectiq-welcomed", "true");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse-soft">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mx-auto" />
        </div>
      </div>
    );
  }

  const tenant = profile?.tenant;
  const status = tenant?.status;
  const pendingInvoice = profile?.invoices?.find(
    (inv: InvoiceInfo) => inv.status === "pending" || inv.status === "failed"
  );

  return (
    <div className="min-h-screen bg-gray-50/50" dir={dir}>
      {/* ── Gradient Header ── */}
      <header className="gradient-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="DialectIQ" className="w-10 h-10 rounded-xl" />
              <div>
                <h1 className="text-lg font-bold text-white">
                  {tenant?.name_ar || "DialectIQ"}
                </h1>
                <p className="text-xs text-white/60">
                  {t(`package.${tenant?.package}` as any)} &bull;{" "}
                  {t(`tenant.${status}` as any)}
                </p>
              </div>
            </div>

            {/* Header stat pills (only when active) */}
            {status === "active" && tenant && (
              <div className="hidden md:flex items-center gap-2">
                <span className="bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium border border-white/10">
                  {tenant.reviews_used_this_month ?? 0} / {tenant.max_reviews_per_month} {t("reviews.title" as any)}
                </span>
                <span className="bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium border border-white/10">
                  <MapPin className="w-3 h-3 inline me-1" />
                  {tenant.place_ids?.length ?? 0} / {tenant.max_businesses}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {status === "active" && (
                <button
                  onClick={startTutorial}
                  className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white border border-white/20 transition-colors"
                  title={t("tutorial.help" as any)}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
              <div className="[&_button]:text-white [&_button]:border-white/20 [&_button]:hover:bg-white/15">
                <LanguageSwitcher />
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-200 border border-red-300/30 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t("admin.logout")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status: Pending Review */}
        {status === "pending_review" && (
          <div className="glass-card rounded-2xl p-10 text-center animate-fade-in">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("client.underReview")}
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {t("client.underReviewDesc")}
            </p>
          </div>
        )}

        {/* Status: Rejected */}
        {status === "rejected" && (
          <div className="glass-card rounded-2xl p-10 text-center animate-fade-in border-red-200/50">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("client.rejected")}
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {tenant?.rejection_reason || t("client.rejectedDesc")}
            </p>
          </div>
        )}

        {/* Status: Approved (need payment) */}
        {status === "approved" && (
          <div className="glass-card rounded-2xl shadow-md overflow-hidden animate-fade-in">
            <div className="gradient-primary px-8 py-6 text-center text-white">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <h2 className="text-xl font-bold mb-1">
                {t("client.paymentRequired")}
              </h2>
              <p className="text-sm text-white/70">
                {t("payment.completePayment")}
              </p>
            </div>

            <div className="p-8">
              {pendingInvoice && (
                <div className="bg-gray-50/80 rounded-xl p-6 mb-6 text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("payment.invoiceAmount")}
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 mb-1">
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

              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
                  <p className="text-sm text-red-600">{payError}</p>
                </div>
              )}

              {/* Check if bank transfer already uploaded & awaiting review */}
              {pendingInvoice?.payment_method === "bank_transfer" && pendingInvoice?.transfer_receipt_url && pendingInvoice?.status === "pending" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t("payment.receiptUploaded" as any)}</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                      {t("payment.receiptUploadedDesc" as any)}
                    </p>
                  </div>
                  {pendingInvoice.transfer_receipt_name && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                      <FileCheck className="w-4 h-4" />
                      {pendingInvoice.transfer_receipt_name}
                    </div>
                  )}
                  <p className="text-xs text-amber-600 font-medium">
                    {t("payment.awaitingReview" as any)}
                  </p>
                </div>
              ) : receiptUploaded ? (
                /* Just uploaded successfully */
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t("payment.receiptUploaded" as any)}</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                      {t("payment.receiptUploadedDesc" as any)}
                    </p>
                  </div>
                </div>
              ) : checkoutId ? (
                /* Card payment flow */
                isMockPayment ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                      <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-center">
                        Mock Payment Gateway
                      </p>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Card Number</label>
                        <input readOnly value="4200 0000 0000 0000" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700" dir="ltr" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Expiry</label>
                          <input readOnly value="12/30" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700" dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">CVV</label>
                          <input readOnly value="123" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700" dir="ltr" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        router.push(
                          `/client/payment-result?id=${encodeURIComponent(checkoutId)}&resourcePath=${encodeURIComponent("/mock/payment")}`
                        );
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-base font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      {t("payment.payNow")}
                    </button>
                  </div>
                ) : (
                  <div ref={paymentFormRef}>
                    <form action="/client/payment-result" className="paymentWidgets" data-brands="VISA MASTER MADA" />
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                      <ShieldCheck className="w-4 h-4" />
                      {t("payment.securePayment")}
                    </div>
                  </div>
                )
              ) : !paymentMethod ? (
                /* Payment method selector — if card disabled, go straight to bank transfer */
                tenant?.card_payment_enabled ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 text-center mb-4">
                    {t("payment.chooseMethod" as any)}
                  </p>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-cyan-400 hover:bg-cyan-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-start flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                        {t("payment.cardPayment" as any)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("payment.cardPaymentDesc" as any)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-start flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {t("payment.bankTransfer" as any)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("payment.bankTransferDesc" as any)}
                      </p>
                    </div>
                  </button>
                </div>
                ) : (
                  /* Card disabled — bank transfer only, auto-select */
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700 text-center mb-4">
                      {t("payment.bankTransfer" as any)}
                    </p>
                    <button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className="w-full flex items-center gap-4 p-4 bg-white border-2 border-emerald-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-start flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {t("payment.bankTransfer" as any)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t("payment.bankTransferDesc" as any)}
                        </p>
                      </div>
                    </button>
                  </div>
                )
              ) : paymentMethod === "card" ? (
                /* Card payment: Pay Now button */
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    ← {t("register.back")}
                  </button>
                  <button
                    onClick={handlePayNow}
                    disabled={payLoading || !pendingInvoice}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
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
                </div>
              ) : (
                /* Bank transfer form */
                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    ← {t("register.back")}
                  </button>

                  {/* Bank details */}
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 space-y-2">
                    <h4 className="font-semibold text-emerald-800 text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {t("payment.bankInfo" as any)}
                    </h4>
                    <div className="text-sm text-emerald-700 space-y-1">
                      <p>{t("payment.bankName" as any)}</p>
                      <p>{t("payment.accountName" as any)}</p>
                      <p className="font-mono text-xs bg-white/60 rounded-lg px-3 py-1.5 border border-emerald-100" dir="ltr">
                        {t("payment.iban" as any)}
                      </p>
                    </div>
                  </div>

                  {/* Receipt upload */}
                  <div className="bg-gray-50/80 rounded-xl p-5 space-y-3">
                    <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t("payment.uploadReceipt" as any)}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {t("payment.uploadReceiptDesc" as any)}
                    </p>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/20 transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {receiptFile ? receiptFile.name : t("payment.chooseReceipt" as any)}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="text-xs text-gray-400">
                      {t("payment.receiptHint" as any)}
                    </p>
                  </div>

                  {/* Failed bank transfer message */}
                  {pendingInvoice?.payment_method === "bank_transfer" && pendingInvoice?.status === "failed" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <p className="text-sm text-red-600">{t("payment.receiptRejected" as any)}</p>
                    </div>
                  )}

                  <button
                    onClick={handleBankTransferUpload}
                    disabled={uploadingReceipt || !receiptFile || !pendingInvoice}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-base font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg"
                  >
                    {uploadingReceipt ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("payment.submitting" as any)}
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        {t("payment.submitReceipt" as any)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status: Active */}
        {status === "active" && (
          <>
            {/* Welcome banner (first visit) */}
            {showWelcome && (
              <div className="glass-card rounded-2xl p-6 border-cyan-200/50 animate-slide-up overflow-hidden relative">
                <div className="absolute top-0 end-0 w-32 h-32 bg-gradient-to-bl from-cyan-100/40 to-transparent rounded-bl-full" />
                <div className="flex items-start gap-4 relative">
                  <div className="p-3 rounded-2xl gradient-primary shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {t("welcome.greeting" as any)}, {tenant?.name_ar}!
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {tenant?.reviews_used_this_month ?? 0} {t("welcome.reviewsAcross" as any)} {tenant?.place_ids?.length ?? 0} {t("welcome.businesses" as any)}
                    </p>
                    <button
                      onClick={() => {
                        dismissWelcome();
                        startTutorial();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold gradient-primary text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <HelpCircle className="w-4 h-4" />
                      {t("welcome.takeTour" as any)}
                    </button>
                  </div>
                  <button
                    onClick={dismissWelcome}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Subscription Usage Bar */}
            {tenant && (() => {
              const reviewsUsed = tenant.reviews_used_this_month ?? 0;
              const reviewsMax = tenant.max_reviews_per_month ?? 1;
              const reviewsRemaining = Math.max(0, reviewsMax - reviewsUsed);
              const reviewsPct = Math.min((reviewsUsed / reviewsMax) * 100, 100);

              let daysRemaining = 0;
              let totalDays = 30;
              let daysPct = 0;
              if (tenant.subscription_starts_at && tenant.subscription_expires_at) {
                const start = new Date(tenant.subscription_starts_at).getTime();
                const end = new Date(tenant.subscription_expires_at).getTime();
                const now = Date.now();
                totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
                daysRemaining = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));
                daysPct = Math.min(((totalDays - daysRemaining) / totalDays) * 100, 100);
              }

              return (
                <div className="glass-card rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: "50ms" }}>
                  {/* Gradient header strip */}
                  <div className="h-1 gradient-primary" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100">
                        <BarChart3 className="w-4 h-4 text-cyan-600" />
                      </div>
                      <h3 className="font-bold text-gray-800">
                        {t("client.subscriptionUsage" as any)}
                      </h3>
                      <span className="ms-auto text-[11px] font-semibold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full capitalize">
                        {tenant.package}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Days Remaining */}
                      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100/80 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: daysRemaining <= 5 ? "#F43F5E" : daysRemaining <= 10 ? "#FBBF24" : "#00D2DF" }} />
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarDays className="w-4 h-4 text-cyan-500" />
                          <span className="text-xs font-medium text-gray-500">
                            {t("client.daysRemaining" as any)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-2xl font-extrabold text-gray-900">{daysRemaining}</span>
                          <span className="text-xs text-gray-400">/ {totalDays} {t("client.days" as any)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${100 - daysPct}%`,
                              background: daysRemaining <= 5 ? "#F43F5E" : daysRemaining <= 10 ? "#FBBF24" : "#00D2DF",
                            }}
                          />
                        </div>
                      </div>

                      {/* Reviews Remaining */}
                      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100/80 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: reviewsRemaining <= 50 ? "#F43F5E" : reviewsRemaining <= 150 ? "#FBBF24" : "#10B981" }} />
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquareText className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-medium text-gray-500">
                            {t("client.reviewsRemaining" as any)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-2xl font-extrabold text-gray-900">{reviewsRemaining}</span>
                          <span className="text-xs text-gray-400">/ {reviewsMax} {t("client.reviews" as any)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${100 - reviewsPct}%`,
                              background: reviewsRemaining <= 50 ? "#F43F5E" : reviewsRemaining <= 150 ? "#FBBF24" : "#10B981",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Two-column grid for settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              {/* Left column */}
              <div className="space-y-4">
                {/* API Key card */}
                <div className="glass-card rounded-2xl p-5 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100">
                        <Key className="w-4 h-4 text-cyan-600" />
                      </div>
                      <h3 className="font-bold text-gray-800">
                        {t("client.apiKey")}
                      </h3>
                    </div>
                    {tenant?.api_key && (
                      <button
                        onClick={copyKey}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-xl text-xs font-semibold hover:bg-cyan-100 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedKey ? t("admin.copied") : t("client.copy")}
                      </button>
                    )}
                  </div>
                  <div className="font-mono text-xs bg-gray-900 rounded-xl p-3.5 text-cyan-400 border border-gray-700/50 break-all">
                    {tenant?.api_key || "—"}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary"
                        style={{
                          width: `${Math.min(((tenant?.reviews_used_this_month ?? 0) / (tenant?.max_reviews_per_month ?? 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 shrink-0 font-medium">
                      {tenant?.reviews_used_this_month}/{tenant?.max_reviews_per_month} {t("client.reviews" as any)}
                    </p>
                  </div>
                </div>

                {/* Place ID management */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-800">
                      {t("client.placeIds")}
                    </h3>
                    <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                      {tenant?.place_ids?.length || 0}/{tenant?.max_businesses}
                    </span>
                  </div>

                  {tenant?.place_ids && tenant.place_ids.length > 0 ? (
                    <div className="space-y-1.5">
                      {tenant.place_ids.map((pid) => (
                        <div
                          key={pid}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-50/80 text-emerald-700 rounded-xl text-xs font-mono border border-emerald-100/80"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{pid}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{t("client.noPlaceIds")}</p>
                  )}

                  {tenant?.pending_place_ids && tenant.pending_place_ids.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[11px] text-amber-600 font-semibold mb-1.5">{t("client.pendingApproval" as any)}</p>
                      <div className="space-y-1.5">
                        {tenant.pending_place_ids.map((pid) => (
                          <div
                            key={pid}
                            className="flex items-center gap-2 px-3 py-2 bg-amber-50/80 text-amber-700 rounded-xl text-xs font-mono border border-amber-200/80"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{pid}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Team Management */}
                <TeamManagement userRole={profile?.role || "member"} />

                {/* Invoices */}
                {profile?.invoices && profile.invoices.length > 0 && (
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100">
                        <FileText className="w-4 h-4 text-violet-600" />
                      </div>
                      <h3 className="font-bold text-gray-800">
                        {t("client.invoices" as any)}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {profile.invoices.filter((inv: InvoiceInfo) => inv.status === "paid").map((inv: InvoiceInfo) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100/50 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {inv.invoice_number || `INV-${inv.id.slice(0, 8)}`}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {inv.total_with_vat?.toLocaleString() || inv.amount_sar.toLocaleString()} {t("register.sarMonth" as any)}
                                {inv.paid_at && ` • ${new Date(inv.paid_at).toLocaleDateString("ar-SA")}`}
                              </p>
                            </div>
                          </div>
                          {inv.invoice_pdf_url && (
                            <button
                              onClick={() => downloadInvoicePdf(inv.id).catch(() => alert("Failed to download"))}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-[11px] font-semibold hover:bg-cyan-100 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              PDF
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fetch Reviews */}
            <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50">
                    <MessageSquareText className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-800">
                    {t("client.fetchReviews")}
                  </h3>
                </div>
                <button
                  onClick={async () => {
                    setFetchLoading(true);
                    setFetchError(null);
                    setFetchResults(null);
                    try {
                      const results = await fetchReviews();
                      setFetchResults(results);
                      loadProfile();
                    } catch (err: any) {
                      setFetchError(err.message || "Failed to fetch reviews");
                    } finally {
                      setFetchLoading(false);
                    }
                  }}
                  disabled={fetchLoading || !tenant?.place_ids?.length}
                  className="flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition-all shadow-md"
                >
                  {fetchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {fetchLoading ? t("client.fetchingReviews") : t("client.fetchReviews")}
                </button>
              </div>

              {!tenant?.place_ids?.length && (
                <p className="text-xs text-gray-400 mt-2">{t("client.noPlaceIds")}</p>
              )}

              {fetchError && (
                <div className="mt-3 p-3 bg-red-50/80 text-red-700 rounded-xl text-sm border border-red-100">
                  {fetchError}
                </div>
              )}

              {fetchResults && (
                <div className="mt-3 space-y-2">
                  {fetchResults.map((r) => (
                    <div
                      key={r.place_id}
                      className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-sm"
                    >
                      <p className="font-semibold text-emerald-800">{r.business_name}</p>
                      <p className="text-emerald-600 text-xs mt-1">
                        {r.reviews_fetched} {t("client.reviewsFetched")} &bull;{" "}
                        {r.reviews_analyzed} {t("client.newAnalyzed")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard */}
            <DashboardShell />

            {/* Tutorial overlay */}
            <TutorialOverlay isActive={tutorialActive} onEnd={endTutorial} />
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
