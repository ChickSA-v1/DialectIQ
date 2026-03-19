"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogArticles, getArticleBySlug } from "@/lib/blog-data";
import { I18nProvider, useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Clock, ArrowLeft, ArrowRight, Share2, BookOpen, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

function ArticlePageInner({ slug }: { slug: string }) {
  const { t, locale, dir } = useI18n();
  const isRTL = dir === "rtl";
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Get related articles (excluding current)
  const related = blogArticles.filter(a => a.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="DialectIQ" className="w-8 h-8 rounded-lg" />
              </Link>
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-400">
                {isRTL ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <Link href="/blog" className="hover:text-gray-600 transition-colors">
                  {locale === "ar" ? "المدونة" : "Blog"}
                </Link>
                {isRTL ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span className="text-gray-600 truncate max-w-[200px]">{article.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link
                href="/register"
                className="px-4 py-2 gradient-primary text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                {locale === "ar" ? "جرّب مجاناً" : "Try Free"}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {article.readTime} {locale === "ar" ? "دقائق قراءة" : "min read"}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(article.publishDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-SA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
          {article.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-500 leading-relaxed mb-10 border-s-4 border-cyan-400 ps-4 py-1">
          {article.metaDescription}
        </p>

        {/* Content */}
        <div className="space-y-10">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                <span className="text-cyan-500 text-lg mt-1 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="text-gray-600 leading-[1.9] whitespace-pre-line text-[15px]">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* CTA Card */}
        <div className="mt-12 gradient-primary rounded-2xl p-8 text-center">
          <Sparkles className="w-8 h-8 text-white/80 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">{article.cta.text}</h3>
          <p className="text-white/70 text-sm mb-5">{article.cta.subtext}</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            {locale === "ar" ? "ابدأ تجربتك المجانية" : "Start Free Trial"}
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        {/* Share */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-sm text-gray-400">
            {locale === "ar" ? "شارك المقال:" : "Share:"}
          </span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://d-iq.io/blog/${article.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            𝕏
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://d-iq.io/blog/${article.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-sm font-bold"
          >
            in
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " " + `https://d-iq.io/blog/${article.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-sm"
          >
            WA
          </a>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            {locale === "ar" ? "مقالات ذات صلة" : "Related Articles"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group glass-card rounded-xl p-5 hover:shadow-md transition-all"
              >
                <span className="text-2xl mb-2 block">{r.heroEmoji}</span>
                <h4 className="font-bold text-gray-900 group-hover:text-cyan-700 transition-colors text-sm leading-relaxed">
                  {r.title}
                </h4>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-cyan-600">
                  {locale === "ar" ? "اقرأ المقال" : "Read"}
                  {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} DialectIQ. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </div>
      </footer>
    </div>
  );
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <I18nProvider>
      <ArticlePageInner slug={slug} />
    </I18nProvider>
  );
}
