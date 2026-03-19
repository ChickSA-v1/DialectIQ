"use client";

import { useState } from "react";
import Link from "next/link";
import { blogArticles } from "@/lib/blog-data";
import { I18nProvider, useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Clock, ArrowLeft, ArrowRight, BookOpen, Globe, Sparkles } from "lucide-react";

function BlogPageInner() {
  const { t, locale, dir } = useI18n();
  const isRTL = dir === "rtl";

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Header */}
      <header className="gradient-header">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="DialectIQ" className="w-9 h-9 rounded-lg" />
              <span className="text-lg font-bold text-white">DialectIQ</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/register"
                className="px-4 py-2 bg-white/15 border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/25 transition-colors"
              >
                {locale === "ar" ? "تجربة مجانية" : "Free Trial"}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-header py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-white/80 mb-6">
            <BookOpen className="w-4 h-4" />
            {locale === "ar" ? "مدونة DialectIQ" : "DialectIQ Blog"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {locale === "ar"
              ? "رؤى ذكية لأصحاب الأعمال في السعودية"
              : "Smart Insights for Saudi Business Owners"}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {locale === "ar"
              ? "مقالات عملية عن تحليل تقييمات العملاء، إدارة السمعة الرقمية، والذكاء الاصطناعي للأعمال"
              : "Practical articles on customer review analysis, reputation management, and AI for business"}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogArticles.map((article, i) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Color strip */}
              <div className="h-1.5 gradient-stripe-indigo" />

              <div className="p-6">
                {/* Category + Read time */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {article.readTime} {locale === "ar" ? "دقائق" : "min"}
                  </span>
                </div>

                {/* Emoji */}
                <div className="text-4xl mb-3">{article.heroEmoji}</div>

                {/* Title */}
                <h2 className="text-base font-bold text-gray-900 leading-relaxed mb-3 group-hover:text-cyan-700 transition-colors line-clamp-3">
                  {article.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                  {article.metaDescription}
                </p>

                {/* Read more */}
                <div className="flex items-center gap-1 text-sm font-semibold text-cyan-600 group-hover:gap-2 transition-all">
                  {locale === "ar" ? "اقرأ المقال" : "Read article"}
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="gradient-primary rounded-2xl p-8 sm:p-12 text-center">
          <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {locale === "ar"
              ? "جاهز تحلل تقييماتك بالذكاء الاصطناعي؟"
              : "Ready to analyze your reviews with AI?"}
          </h2>
          <p className="text-white/70 mb-6">
            {locale === "ar"
              ? "ابدأ تجربتك المجانية لمدة 7 أيام — بدون بطاقة ائتمانية"
              : "Start your free 7-day trial — no credit card required"}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            {locale === "ar" ? "ابدأ مجاناً" : "Start Free"}
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} DialectIQ. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </div>
      </footer>
    </div>
  );
}

export default function BlogPage() {
  return (
    <I18nProvider>
      <BlogPageInner />
    </I18nProvider>
  );
}
