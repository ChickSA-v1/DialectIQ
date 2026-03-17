"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getRole } from "@/lib/auth";
import { I18nProvider, useI18n } from "@/lib/i18n";
import {
  Loader2,
  Menu,
  X,
  Sparkles,
  Globe,
  MessageSquareReply,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ArrowRight,
  Play,
  Zap,
  BarChart3,
  Shield,
} from "lucide-react";

/* ──────────────────────────── hooks ──────────────────────────── */

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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ──────────────────────────── page ───────────────────────────── */

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      const role = getRole();
      router.replace(role === "admin" ? "/admin/registrations" : "/client");
    } else {
      setShowLanding(true);
    }
    setReady(true);
  }, [router]);

  if (!ready || (!showLanding && !isLoggedIn())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (showLanding)
    return (
      <I18nProvider>
        <LandingPage />
      </I18nProvider>
    );
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */

function LandingPage() {
  const { t, locale, setLocale, dir } = useI18n();
  const isAr = locale === "ar";

  return (
    <div dir={dir} className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] ${isAr ? "font-sans" : ""}`}>
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}

/* ─────────────── 1. Navbar ─────────────── */

function Navbar() {
  const { t, locale, setLocale, dir } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-card shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="https://d-iq.io" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="DialectIQ" className="w-9 h-9 rounded-lg" />
          <span className="text-xl font-bold text-gray-900">DialectIQ</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo("features")} className="text-sm text-gray-600 hover:text-cyan-600 transition-colors">
            {t("landing.nav.features")}
          </button>
          <button onClick={() => scrollTo("pricing")} className="text-sm text-gray-600 hover:text-cyan-600 transition-colors">
            {t("landing.nav.pricing")}
          </button>
          <button onClick={() => scrollTo("faq")} className="text-sm text-gray-600 hover:text-cyan-600 transition-colors">
            {t("landing.nav.faq")}
          </button>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {locale === "en" ? "العربية" : "English"}
          </button>
          <a href="/login" className="text-sm text-gray-700 hover:text-cyan-600 font-medium transition-colors">
            {t("landing.nav.login")}
          </a>
          <a
            href="/register"
            className="gradient-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-200"
          >
            {t("landing.nav.cta")}
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-card mt-2 mx-4 rounded-2xl p-4 animate-slide-down">
          <div className="flex flex-col gap-3">
            <button onClick={() => scrollTo("features")} className="text-sm text-gray-700 py-2">{t("landing.nav.features")}</button>
            <button onClick={() => scrollTo("pricing")} className="text-sm text-gray-700 py-2">{t("landing.nav.pricing")}</button>
            <button onClick={() => scrollTo("faq")} className="text-sm text-gray-700 py-2">{t("landing.nav.faq")}</button>
            <hr className="border-gray-200" />
            <button onClick={() => setLocale(locale === "en" ? "ar" : "en")} className="text-sm text-gray-500 py-2">
              {locale === "en" ? "العربية" : "English"}
            </button>
            <a href="/login" className="text-sm text-gray-700 py-2 font-medium">{t("landing.nav.login")}</a>
            <a href="/register" className="gradient-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center">
              {t("landing.nav.cta")}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────── 2. Hero ─────────────── */

function Hero() {
  const { t, dir } = useI18n();
  const ref = useScrollReveal();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob w-96 h-96 bg-cyan-300/30 -top-20 -left-40" />
      <div className="blob w-80 h-80 bg-amber-300/25 top-32 -right-32" style={{ animationDelay: "5s" }} />
      <div className="blob w-64 h-64 bg-purple-200/20 bottom-0 left-1/4" style={{ animationDelay: "10s" }} />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text side */}
          <div className="text-center lg:text-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 text-cyan-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              {t("landing.hero.badge")}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-tight mb-6">
              <span className="gradient-text">{t("landing.hero.title")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 mb-8">
              {t("landing.hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-8">
              <a
                href="/register"
                className="gradient-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-200 flex items-center gap-2"
              >
                {t("landing.hero.cta.primary")}
                <ArrowRight className="w-4 h-4" />
              </a>
              <button className="glass-card text-gray-700 font-medium px-8 py-3.5 rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-600" />
                {t("landing.hero.cta.secondary")}
              </button>
            </div>

            {/* Floating stat badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {[
                { key: "landing.hero.stat.accuracy" as const, icon: <Zap className="w-4 h-4 text-cyan-600" /> },
                { key: "landing.hero.stat.dialects" as const, icon: <Globe className="w-4 h-4 text-amber-600" /> },
                { key: "landing.hero.stat.realtime" as const, icon: <BarChart3 className="w-4 h-4 text-purple-600" /> },
              ].map(({ key, icon }) => (
                <div
                  key={key}
                  className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  {icon}
                  {t(key)}
                </div>
              ))}
            </div>
          </div>

          {/* Illustration side */}
          <div className="hidden lg:flex items-center justify-center">
            <img
              src="/images/hero-dashboard.svg"
              alt="DialectIQ Dashboard Preview"
              className="w-full max-w-[540px] animate-float"
              style={{ animationDuration: "8s" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 3. Trust Bar ─────────────── */

function TrustBar() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="py-12 border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 mb-8">{t("landing.trust.title")}</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { stat: t("landing.trust.stat1"), label: t("landing.trust.stat1Label") },
            { stat: t("landing.trust.stat2"), label: t("landing.trust.stat2Label") },
            { stat: t("landing.trust.stat3"), label: t("landing.trust.stat3Label") },
          ].map(({ stat, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{stat}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 4. Features ─────────────── */

function Features() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  const features = [
    {
      icon: <Globe className="w-6 h-6 text-white" />,
      title: t("landing.feature1.title"),
      desc: t("landing.feature1.desc"),
      accent: "from-cyan-500 to-amber-500",
      stripe: "gradient-stripe-indigo",
      pills: ["Najdi", "Hijazi", "Sharqi", "MSA", "Arabizi"],
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: t("landing.feature2.title"),
      desc: t("landing.feature2.desc"),
      accent: "from-emerald-500 to-teal-500",
      stripe: "gradient-stripe-emerald",
    },
    {
      icon: <MessageSquareReply className="w-6 h-6 text-white" />,
      title: t("landing.feature3.title"),
      desc: t("landing.feature3.desc"),
      accent: "from-amber-500 to-yellow-500",
      stripe: "gradient-stripe-amber",
    },
    {
      icon: <MapPin className="w-6 h-6 text-white" />,
      title: t("landing.feature4.title"),
      desc: t("landing.feature4.desc"),
      accent: "from-rose-500 to-pink-500",
      stripe: "gradient-stripe-rose",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 start-0 w-72 h-72 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 end-0 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-amber-50 border border-cyan-200/60 text-sm font-semibold px-5 py-2 rounded-full mb-5" style={{ color: '#0B1B3D' }}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-soft" />
            {t("landing.features.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5" style={{ color: '#0B1B3D' }}>{t("landing.features.title")}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">{t("landing.features.subtitle")}</p>
        </div>

        {/* Bento Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Feature 1 — Large card spanning 2 cols */}
          <div
            className="sm:col-span-2 lg:col-span-2 group relative rounded-3xl overflow-hidden border border-gray-200/60 bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            style={{ animationDelay: '0s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-transparent to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-8 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center mb-5 shadow-lg shadow-cyan-200/50 group-hover:scale-110 transition-transform duration-300">
                    {features[0].icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#0B1B3D' }}>{features[0].title}</h3>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-5 max-w-lg">{features[0].desc}</p>
                  {features[0].pills && (
                    <div className="flex flex-wrap gap-2">
                      {features[0].pills.map((p) => (
                        <span key={p} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-cyan-200 bg-white text-cyan-700 shadow-sm group-hover:bg-cyan-50 transition-colors">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                  <Globe className="w-16 h-16 text-cyan-300 mx-auto mt-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 — Tall card */}
          <div
            className="group relative rounded-3xl overflow-hidden border border-gray-200/60 bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform duration-300">
                {features[1].icon}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#0B1B3D' }}>{features[1].title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{features[1].desc}</p>
              {/* Mini chart visual */}
              <div className="mt-6 flex items-end gap-1.5 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-400 to-emerald-200 group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-500"
                    style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div
            className="group relative rounded-3xl overflow-hidden border border-gray-200/60 bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-transparent to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center mb-5 shadow-lg shadow-amber-200/50 group-hover:scale-110 transition-transform duration-300">
                {features[2].icon}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#0B1B3D' }}>{features[2].title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{features[2].desc}</p>
              {/* Chat bubble visual */}
              <div className="space-y-2">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs text-gray-500 w-3/4">
                  <div className="h-2 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs text-white w-3/4 ms-auto shadow-sm">
                  <div className="h-2 bg-white/40 rounded w-full mb-1" />
                  <div className="h-2 bg-white/40 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 — Wide card spanning 2 cols */}
          <div
            className="sm:col-span-2 group relative rounded-3xl overflow-hidden border border-gray-200/60 bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-transparent to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-8 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center mb-5 shadow-lg shadow-rose-200/50 group-hover:scale-110 transition-transform duration-300">
                    {features[3].icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#0B1B3D' }}>{features[3].title}</h3>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-lg">{features[3].desc}</p>
                </div>
                {/* Map pin visual */}
                <div className="hidden sm:flex items-center gap-3">
                  {[
                    { city: "RUH", color: "bg-cyan-400" },
                    { city: "JED", color: "bg-amber-400" },
                    { city: "DMM", color: "bg-emerald-400" },
                  ].map((pin) => (
                    <div key={pin.city} className="text-center group-hover:scale-105 transition-transform">
                      <div className={`w-10 h-10 ${pin.color} rounded-full flex items-center justify-center shadow-md mb-1`}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{pin.city}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 5. How It Works ─────────────── */

function HowItWorks() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  const steps = [
    { num: "1", img: "/images/step-connect.svg", title: t("landing.how.step1.title"), desc: t("landing.how.step1.desc") },
    { num: "2", img: "/images/step-analyze.svg", title: t("landing.how.step2.title"), desc: t("landing.how.step2.desc") },
    { num: "3", img: "/images/step-insights.svg", title: t("landing.how.step3.title"), desc: t("landing.how.step3.desc") },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-cyan-50 text-cyan-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            {t("landing.how.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">{t("landing.how.title")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-cyan-200 via-amber-200 to-purple-200" />

          {steps.map((s, i) => (
            <div key={i} className="relative text-center" style={{ animationDelay: `${i * 0.15}s` }}>
              {/* Step illustration */}
              <div className="relative inline-block mb-4">
                <img src={s.img} alt={s.title} className="w-32 h-32 mx-auto" />
                <span className="absolute top-0 right-2 w-7 h-7 rounded-full gradient-primary text-white text-xs font-bold flex items-center justify-center shadow-md z-10">
                  {s.num}
                </span>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 6. Dashboard Preview ─────────────── */

function DashboardPreview() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section className="py-20 md:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text side */}
          <div>
            <span className="inline-block bg-cyan-50 text-cyan-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              {t("landing.preview.badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.preview.title")}</h2>
            <p className="text-gray-600 mb-8">{t("landing.preview.desc")}</p>
            <ul className="space-y-3">
              {(["landing.preview.point1", "landing.preview.point2", "landing.preview.point3", "landing.preview.point4"] as const).map((k) => (
                <li key={k} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>

          {/* Faux dashboard mockup */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-elevated">
            {/* Browser chrome */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 truncate">
                app.dialectiq.com/dashboard
              </div>
            </div>

            {/* Header */}
            <div className="gradient-header px-6 py-4">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="DialectIQ" className="w-6 h-6 rounded" />
                <span className="text-white font-semibold text-sm">DialectIQ</span>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="bg-gray-50 p-4 space-y-3">
              {/* Mini stat cards */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Reviews", value: "1,247", color: "text-cyan-600" },
                  { label: "Sentiment", value: "7.8", color: "text-emerald-600" },
                  { label: "Rating", value: "4.3", color: "text-amber-600" },
                  { label: "Urgent", value: "12", color: "text-red-500" },
                ].map((c) => (
                  <div key={c.label} className="bg-white rounded-lg p-2 text-center shadow-sm">
                    <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
                    <div className="text-[10px] text-gray-400">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-[10px] text-gray-400 mb-2">Sentiment Trend</div>
                  <div className="flex items-end gap-1 h-12">
                    {[60, 45, 70, 55, 80, 65, 75, 85, 70, 90].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-cyan-500 to-amber-400" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-[10px] text-gray-400 mb-2">Dialects</div>
                  <div className="flex items-center justify-center h-12">
                    <div className="w-12 h-12 rounded-full border-4 border-cyan-500 relative">
                      <div className="absolute inset-1 rounded-full border-3 border-amber-400 border-t-transparent border-l-transparent" />
                    </div>
                    <div className="ms-2 space-y-0.5">
                      <div className="flex items-center gap-1 text-[9px] text-gray-500"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Najdi</div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500"><div className="w-2 h-2 rounded-full bg-amber-400" /> Hijazi</div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500"><div className="w-2 h-2 rounded-full bg-purple-300" /> Sharqi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review rows */}
              <div className="space-y-1.5">
                {[
                  { name: "Ahmed", text: "ما قصروا والله", score: 9.2, dialect: "Najdi" },
                  { name: "Sara", text: "الخدمة حلوة بس...", score: 6.5, dialect: "Hijazi" },
                ].map((r) => (
                  <div key={r.name} className="bg-white rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">{r.text}</div>
                      <div className="text-[9px] text-gray-400">{r.dialect}</div>
                    </div>
                    <div className={`text-xs font-bold ${r.score >= 7 ? "text-emerald-600" : "text-amber-600"}`}>
                      {r.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 7. Pricing ─────────────── */

function Pricing() {
  const { t, locale } = useI18n();
  const ref = useScrollReveal();

  const plans = [
    {
      name: t("package.basic"),
      price: "500",
      businesses: `1 ${t("landing.pricing.businesses")}`,
      reviews: `500 ${t("landing.pricing.reviewsMonth")}`,
      features: ["landing.pricing.dialects" as const, "landing.pricing.sentiment" as const],
      highlighted: false,
    },
    {
      name: t("package.advanced"),
      price: "1,500",
      businesses: `5 ${t("landing.pricing.businesses")}`,
      reviews: `2,000 ${t("landing.pricing.reviewsMonth")}`,
      features: [
        "landing.pricing.dialects" as const,
        "landing.pricing.sentiment" as const,
        "landing.pricing.replies" as const,
        "landing.pricing.support" as const,
      ],
      highlighted: true,
    },
    {
      name: t("package.enterprise"),
      price: "2,500",
      businesses: `${t("landing.pricing.unlimited")} ${t("landing.pricing.businesses")}`,
      reviews: `${t("landing.pricing.unlimited")} ${t("landing.pricing.reviewsMonth")}`,
      features: [
        "landing.pricing.dialects" as const,
        "landing.pricing.sentiment" as const,
        "landing.pricing.replies" as const,
        "landing.pricing.support" as const,
        "landing.pricing.api" as const,
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50/50">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-cyan-50 text-cyan-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            {t("landing.pricing.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("landing.pricing.title")}</h2>
          <p className="text-gray-600 max-w-xl mx-auto">{t("landing.pricing.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden flex flex-col ${
                plan.highlighted
                  ? "ring-2 ring-cyan-500 shadow-elevated scale-[1.02] bg-white"
                  : "glass-card"
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.highlighted && (
                <div className="gradient-primary text-white text-center text-xs font-semibold py-1.5">
                  {t("landing.pricing.popular")}
                </div>
              )}
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold gradient-text">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{locale === "ar" ? "ريال/شهر" : "SAR/mo"}</span>
                </div>
                <div className="text-sm text-gray-500 mb-6 space-y-0.5">
                  <div>{plan.businesses}</div>
                  <div>{plan.reviews}</div>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((fk) => (
                    <li key={fk} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {t(fk)}
                    </li>
                  ))}
                </ul>

                <a
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? "gradient-primary text-white shadow-lg shadow-cyan-200 hover:opacity-90"
                      : "border border-gray-200 text-gray-700 hover:border-cyan-300 hover:text-cyan-600"
                  }`}
                >
                  {t("landing.pricing.cta")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 8. FAQ ─────────────── */

function FAQ() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const items = [
    { q: t("landing.faq1.q"), a: t("landing.faq1.a") },
    { q: t("landing.faq2.q"), a: t("landing.faq2.a") },
    { q: t("landing.faq3.q"), a: t("landing.faq3.a") },
    { q: t("landing.faq4.q"), a: t("landing.faq4.a") },
    { q: t("landing.faq5.q"), a: t("landing.faq5.a") },
    { q: t("landing.faq6.q"), a: t("landing.faq6.a") },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50/50">
      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-cyan-50 text-cyan-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            {t("landing.faq.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">{t("landing.faq.title")}</h2>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-start"
                >
                  <span className="font-medium text-sm text-gray-800">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "200px" : "0px" }}
                >
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 10. CTA Banner ─────────────── */

function CTABanner() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gradient-primary rounded-3xl px-8 py-14 md:px-16 md:py-20 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 relative z-10">
            {t("landing.cta.title")}
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto relative z-10">
            {t("landing.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a
              href="/register"
              className="bg-white text-cyan-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2"
            >
              {t("landing.cta.button")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <p className="text-white/60 text-sm mt-6 relative z-10">
            {t("landing.cta.login")}{" "}
            <a href="/login" className="text-white underline hover:text-white/90">
              {t("landing.cta.signin")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 11. Footer ─────────────── */

function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="https://d-iq.io" className="flex items-center gap-2 mb-4">
              <img src="/images/logo.png" alt="DialectIQ" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-white">DialectIQ</span>
            </a>
            <p className="text-sm leading-relaxed">{t("landing.footer.desc")}</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t("landing.footer.product")}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">{t("landing.nav.features")}</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">{t("landing.nav.pricing")}</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">{t("landing.nav.faq")}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t("landing.footer.legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition-colors">{t("landing.footer.privacy")}</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">{t("landing.footer.terms")}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{t("landing.footer.contact")}</h4>
            <ul className="space-y-2 text-sm">
              <li>support@d-iq.io</li>
              <li>Riyadh, Saudi Arabia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} {t("landing.footer.copyright")}</p>
          <div className="flex items-center gap-2">
            <span>{t("landing.footer.builtFor")} 🇸🇦</span>
            <span className="text-gray-600">|</span>
            <span>{t("landing.footer.builtBy")} <a href="https://dataweave.sa" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">DataWeave</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
