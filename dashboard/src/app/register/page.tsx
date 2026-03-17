"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { register, uploadDocument } from "@/lib/auth";
import {
  Building2,
  Upload,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";

const STEPS = ["info", "package", "documents", "done"] as const;
type Step = (typeof STEPS)[number];

function RegisterWizard() {
  const { t, dir, locale } = useI18n();
  const router = useRouter();
  const isRTL = dir === "rtl";

  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tenantId, setTenantId] = useState("");

  // Step 1: Business info
  const [form, setForm] = useState({
    business_name_ar: "",
    business_name_en: "",
    email: "",
    phone: "",
    password: "",
    full_name: "",
  });

  // Step 2: Package
  const [selectedPkg, setSelectedPkg] = useState("basic");

  // Step 3: Documents
  const [crFile, setCrFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const packages = [
    {
      key: "basic",
      price: 500,
      businesses: 1,
      reviews: 500,
    },
    {
      key: "advanced",
      price: 1500,
      businesses: 5,
      reviews: 2000,
    },
    {
      key: "enterprise",
      price: 2500,
      businesses: "∞",
      reviews: "∞",
    },
  ];

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await register({
        ...form,
        package: selectedPkg,
      });
      setTenantId(res.tenant_id);
      setStep("documents");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!crFile || !idFile) {
      setError(t("register.bothDocsRequired"));
      return;
    }
    setUploading(true);
    setError("");
    try {
      await uploadDocument(tenantId, "commercial_registration", crFile);
      await uploadDocument(tenantId, "owner_id", idFile);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir={dir}>
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="DialectIQ" className="w-14 h-14 rounded-xl mb-4 inline-block" />
          <h1 className="text-2xl font-bold text-gray-900">{t("register.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("register.subtitle")}</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  STEPS.indexOf(step) >= i
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-12 h-0.5 ${
                    STEPS.indexOf(step) > i ? "bg-cyan-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Business Info */}
        {step === "info" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-800">{t("register.businessInfo")}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("register.businessNameAr")} *
                </label>
                <input
                  value={form.business_name_ar}
                  onChange={(e) => setForm({ ...form, business_name_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="rtl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("register.businessNameEn")}
                </label>
                <input
                  value={form.business_name_en}
                  onChange={(e) => setForm({ ...form, business_name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("register.fullName")} *
              </label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.email")} *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("register.phone")} *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  dir="ltr"
                  placeholder="+966"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.password")} *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                dir="ltr"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-400 mt-1">{t("register.passwordHint")}</p>
            </div>

            <button
              onClick={() => setStep("package")}
              disabled={!form.business_name_ar || !form.email || !form.password || !form.full_name || !form.phone}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              {t("register.next")}
            </button>

            <p className="text-center text-sm text-gray-500">
              {t("register.haveAccount")}{" "}
              <a href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
                {t("auth.login")}
              </a>
            </p>
          </div>
        )}

        {/* Step 2: Package selection */}
        {step === "package" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-800">{t("register.choosePackage")}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.key}
                  onClick={() => setSelectedPkg(pkg.key)}
                  className={`relative bg-white rounded-xl border-2 p-5 text-start transition-all ${
                    selectedPkg === pkg.key
                      ? "border-cyan-600 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {selectedPkg === pkg.key && (
                    <div className="absolute top-3 end-3">
                      <CheckCircle className="w-5 h-5 text-cyan-600" />
                    </div>
                  )}
                  {pkg.key === "advanced" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium mb-2">
                      <Sparkles className="w-3 h-3" />
                      {t("register.popular")}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-900 text-lg">
                    {t(`package.${pkg.key}` as any)}
                  </h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-cyan-600">{pkg.price}</span>
                    <span className="text-sm text-gray-500 ms-1">{t("register.sarMonth")}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    <li>
                      {typeof pkg.businesses === "number"
                        ? `${pkg.businesses} ${t("register.businesses")}`
                        : t("register.unlimitedBusinesses")}
                    </li>
                    <li>
                      {typeof pkg.reviews === "number"
                        ? `${pkg.reviews} ${t("register.reviewsMonth")}`
                        : t("register.unlimitedReviews")}
                    </li>
                  </ul>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("info")}
                className="flex items-center gap-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <BackIcon className="w-4 h-4" />
                {t("register.back")}
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {loading ? t("register.submitting") : t("register.submitRegistration")}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Document upload */}
        {step === "documents" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-800">{t("register.uploadDocs")}</h2>
            </div>
            <p className="text-sm text-gray-500">{t("register.uploadDocsDesc")}</p>

            {/* Commercial Registration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("register.commercialReg")} *
              </label>
              <label className="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {crFile ? crFile.name : t("register.chooseFile")}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setCrFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Owner ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("register.ownerId")} *
              </label>
              <label className="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {idFile ? idFile.name : t("register.chooseFile")}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <p className="text-xs text-gray-400">{t("register.fileHint")}</p>

            <button
              onClick={handleUpload}
              disabled={uploading || !crFile || !idFile}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? t("register.uploading") : t("register.uploadAndSubmit")}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "done" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("register.successTitle")}
            </h2>
            <p className="text-sm text-gray-500 mb-6">{t("register.successDesc")}</p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              {t("auth.login")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <I18nProvider>
      <RegisterWizard />
    </I18nProvider>
  );
}
