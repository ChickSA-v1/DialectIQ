"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { verifyPaymentResult } from "@/lib/auth";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

function PaymentResultContent() {
  const { t, dir, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  useEffect(() => {
    const checkoutId = searchParams.get("id");
    const resourcePath = searchParams.get("resourcePath");

    if (!checkoutId || !resourcePath) {
      setStatus("failed");
      setError("Missing payment parameters");
      return;
    }

    verifyPayment(checkoutId, resourcePath);
  }, [searchParams]);

  const verifyPayment = async (
    checkoutId: string,
    resourcePath: string
  ) => {
    try {
      const result = await verifyPaymentResult(checkoutId, resourcePath);
      if (result.status === "paid") {
        setStatus("success");
      } else {
        setStatus("failed");
        setError(result.status);
      }
    } catch (err: any) {
      setStatus("failed");
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={dir}>
      <div className="max-w-md w-full">
        {/* Loading */}
        {status === "loading" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
            <Loader2 className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {t("payment.verifying")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("payment.securePayment")}
            </p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("payment.successTitle")}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {t("payment.successDesc")}
            </p>
            <button
              onClick={() => router.push("/client")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl text-base font-semibold hover:bg-cyan-700 transition-colors"
            >
              {t("payment.backToDashboard")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Failed */}
        {status === "failed" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("payment.failedTitle")}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              {t("payment.failedDesc")}
            </p>
            {error && (
              <p className="text-xs text-red-400 mb-6 font-mono">{error}</p>
            )}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/client")}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl text-base font-semibold hover:bg-cyan-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                {t("payment.tryAgain")}
              </button>
              <button
                onClick={() => router.push("/client")}
                className="w-full px-6 py-2.5 text-gray-600 text-sm hover:text-gray-800 transition-colors"
              >
                {t("payment.backToDashboard")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <I18nProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        }
      >
        <PaymentResultContent />
      </Suspense>
    </I18nProvider>
  );
}
