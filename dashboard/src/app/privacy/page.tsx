"use client";

import { useEffect, useRef, ReactNode } from "react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ArrowLeft, Globe, Shield, FileText, Scale } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <I18nProvider>
      <PrivacyContent />
    </I18nProvider>
  );
}

/* ── Scroll-reveal hook (same as landing page) ──────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("scroll-hidden");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("scroll-hidden");
          el.classList.add("scroll-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ── Animated section item ──────────────────────────────────────────── */
function AnimatedItem({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}

/* ── Main content ───────────────────────────────────────────────────── */
function PrivacyContent() {
  const { t, locale, setLocale, dir } = useI18n();
  const heroRef = useScrollReveal();
  const termsRef = useScrollReveal();
  const privacyRef = useScrollReveal();
  const contactRef = useScrollReveal();

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10"
        style={{ animation: "slide-down 0.4s ease-out both" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t("privacy.backHome" as any)}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="DialectIQ" className="w-7 h-7 rounded-lg" />
              <span className="text-sm font-bold text-gray-900">DialectIQ</span>
            </Link>
            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === "en" ? "AR" : "EN"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Page title */}
        <div ref={heroRef} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full text-cyan-600 text-xs font-medium mb-4">
            <Scale className="w-4 h-4" />
            {t("privacy.legalDocs" as any)}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t("privacy.pageTitle" as any)}
          </h1>
          <p className="text-gray-500 text-sm">
            {t("privacy.lastUpdated" as any)}
          </p>
        </div>

        {/* ─── Terms and Conditions ─── */}
        <div ref={termsRef}>
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6 hover:shadow-md transition-shadow duration-300">
            <AnimatedItem delay={0}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("privacy.termsTitle" as any)}
                </h2>
              </div>
            </AnimatedItem>

            {/* 1 */}
            <AnimatedItem delay={80}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.terms1Title" as any)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("privacy.terms1Body" as any)}
                </p>
              </div>
            </AnimatedItem>

            {/* 2 */}
            <AnimatedItem delay={160}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.terms2Title" as any)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("privacy.terms2Body" as any)}
                </p>
              </div>
            </AnimatedItem>

            {/* 3 */}
            <AnimatedItem delay={240}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.terms3Title" as any)}
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1">
                  <li>{t("privacy.terms3Bullet1" as any)}</li>
                  <li>{t("privacy.terms3Bullet2" as any)}</li>
                </ul>
              </div>
            </AnimatedItem>

            {/* 4 */}
            <AnimatedItem delay={320}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.terms4Title" as any)}
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1">
                  <li>{t("privacy.terms4Bullet1" as any)}</li>
                  <li>{t("privacy.terms4Bullet2" as any)}</li>
                </ul>
              </div>
            </AnimatedItem>

            {/* 5 */}
            <AnimatedItem delay={400}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.terms5Title" as any)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("privacy.terms5Body" as any)}
                </p>
              </div>
            </AnimatedItem>

            {/* 6 */}
            <AnimatedItem delay={480}>
              <div className="p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.terms6Title" as any)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("privacy.terms6Body" as any)}
                </p>
              </div>
            </AnimatedItem>
          </section>
        </div>

        {/* ─── Privacy Policy ─── */}
        <div ref={privacyRef}>
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6 hover:shadow-md transition-shadow duration-300">
            <AnimatedItem delay={0}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("privacy.privacyTitle" as any)}
                </h2>
              </div>
            </AnimatedItem>

            {/* 1 */}
            <AnimatedItem delay={80}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.priv1Title" as any)}
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1">
                  <li>{t("privacy.priv1Bullet1" as any)}</li>
                  <li>{t("privacy.priv1Bullet2" as any)}</li>
                  <li>{t("privacy.priv1Bullet3" as any)}</li>
                </ul>
              </div>
            </AnimatedItem>

            {/* 2 */}
            <AnimatedItem delay={160}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.priv2Title" as any)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("privacy.priv2Body" as any)}
                </p>
              </div>
            </AnimatedItem>

            {/* 3 */}
            <AnimatedItem delay={240}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.priv3Title" as any)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("privacy.priv3Body" as any)}
                </p>
              </div>
            </AnimatedItem>

            {/* 4 */}
            <AnimatedItem delay={320}>
              <div className="mb-6 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.priv4Title" as any)}
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1">
                  <li>{t("privacy.priv4Bullet1" as any)}</li>
                  <li>{t("privacy.priv4Bullet2" as any)}</li>
                </ul>
              </div>
            </AnimatedItem>

            {/* 5 */}
            <AnimatedItem delay={400}>
              <div className="p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t("privacy.priv5Title" as any)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("privacy.priv5Body" as any)}
                </p>
              </div>
            </AnimatedItem>
          </section>
        </div>

        {/* Contact */}
        <div ref={contactRef} className="text-center text-sm text-gray-400 py-6">
          {t("privacy.contactLine" as any)}
        </div>
      </main>
    </div>
  );
}
