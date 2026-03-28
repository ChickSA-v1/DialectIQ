"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquareReply,
  Globe,
  Zap,
  BarChart3,
  CheckCircle,
  ArrowLeft,
  Star,
  Clock,
  TrendingUp,
  Shield,
  ChevronDown,
} from "lucide-react";

/* ── Pixel helper ── */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}
function trackEvent(event: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

/* ── countdown hook ── */
function useCountdown() {
  const [hours, setHours] = useState(23);
  const [minutes, setMinutes] = useState(59);
  const [seconds, setSeconds] = useState(59);

  useEffect(() => {
    const end = Date.now() + 24 * 60 * 60 * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setHours(Math.floor(diff / 3600000));
      setMinutes(Math.floor((diff % 3600000) / 60000));
      setSeconds(Math.floor((diff % 60000) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { hours, minutes, seconds };
}

/* ── scroll reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ════════════════════════════════════════════
   ADS LANDING PAGE
   ════════════════════════════════════════════ */

export default function AdsLandingPage() {
  useEffect(() => {
    trackEvent("ViewContent", {
      content_name: "Ads Landing Page",
      content_category: "landing",
    });
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      <TopBar />
      <Hero />
      <PainPoints />
      <SocialProof />
      <Features />
      <BeforeAfter />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <StickyMobileCTA />
    </div>
  );
}

/* ─────────────── Top Bar ─────────────── */
function TopBar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="DialectIQ"
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-bold text-gray-900 text-sm">DialectIQ</span>
        </div>
        <Link
          href="/register"
          onClick={() => trackEvent("Lead", { content_name: "topbar_cta" })}
          className="px-5 py-2 bg-gradient-to-l from-cyan-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
        >
          ابدأ مجاناً
        </Link>
      </div>
    </header>
  );
}

/* ─────────────── Hero ─────────────── */
function Hero() {
  const { hours, minutes, seconds } = useCountdown();

  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-slate-900 via-slate-800 to-cyan-900 text-white">
      {/* bg glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[96px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
        {/* urgency badge */}
        <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-1.5 rounded-full text-xs font-bold mb-6 animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          العرض ينتهي خلال {hours}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-5">
          تقييماتك السلبية تكلفك
          <span className="block text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-400 mt-2">
            12,000 ريال شهرياً
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
          كل تقييم سلبي بدون رد يُفقدك 5 عملاء محتملين. DialectIQ يحلل
          تقييمات قوقل ويرد عليها بلهجة عميلك — تلقائياً.
        </p>

        <Link
          href="/register"
          onClick={() => trackEvent("Lead", { content_name: "hero_cta" })}
          className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-l from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-cyan-500/30"
        >
          جرّب 7 أيام مجاناً — بدون بطاقة
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            بدون بطاقة ائتمانية
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            تفعيل فوري
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            إلغاء بأي وقت
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Pain Points ─────────────── */
function PainPoints() {
  const ref = useReveal();
  const pains = [
    {
      icon: "😤",
      title: "تقييم سلبي بدون رد",
      desc: "كل يوم يمر بدون رد = 100 عميل محتمل يقرأ الشكوى ويروح لمنافسك",
    },
    {
      icon: "🤖",
      title: "ردود آلية مملة",
      desc: '"شكراً لتقييمك" المتكرر يزيد غضب العميل ويعطي انطباع سيء',
    },
    {
      icon: "😅",
      title: "ما تفهم لهجة عميلك",
      desc: '"بيّض الله وجيهكم" مدح ولا سخرية؟ الأدوات العالمية ما تعرف الفرق',
    },
    {
      icon: "⏰",
      title: "وقتك ضايع بالردود",
      desc: "ساعة يومياً من وقتك في قراءة تقييمات والرد عليها يدوياً",
    },
  ];

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">
        هل تعاني من هالمشاكل؟
      </h2>
      <p className="text-gray-500 text-center mb-10">
        إذا عندك مطعم أو متجر في السعودية، أكيد تواجه واحدة منها على الأقل
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {pains.map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl shrink-0">{p.icon}</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Social Proof ─────────────── */
function SocialProof() {
  const ref = useReveal();
  const stats = [
    { value: "89%+", label: "دقة تحليل اللهجات السعودية" },
    { value: "30 ثانية", label: "متوسط وقت الرد التلقائي" },
    { value: "10 ساعات", label: "يوفرها لك أسبوعياً" },
    { value: "40%+", label: "تحسن في تقييمات قوقل" },
  ];

  return (
    <section ref={ref} className="bg-gradient-to-l from-cyan-600 to-blue-600 py-12">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="text-3xl sm:text-4xl font-extrabold mb-1">{s.value}</div>
            <div className="text-sm text-white/80">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Features ─────────────── */
function Features() {
  const ref = useReveal();
  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "يفهم اللهجات السعودية",
      desc: "نجدي، حجازي، شرقي، عربيزي — يكشف السخرية والتهكم اللي تفوته الأدوات العالمية",
    },
    {
      icon: <MessageSquareReply className="w-6 h-6" />,
      title: "ردود ذكية بلهجة عميلك",
      desc: "مو بس 'شكراً لتقييمك'. ردود شخصية تعالج نقاط العميل بالتحديد",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "رد فوري — 30 ثانية",
      desc: "بدل ما تتأخر أيام، النظام يصيغ رد ذكي فوراً. أنت بس تراجع وتنشر",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "تقارير تكشف المشاكل",
      desc: "لوحة تحكم تبيّن لك وش المشاكل المتكررة وأي فرع يحتاج تحسين",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "حماية سمعتك الرقمية",
      desc: "تنبيهات فورية للتقييمات الخطيرة اللي تحتاج تدخل سريع",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "ترتيب أعلى في قوقل",
      desc: "الردود المنتظمة تحسّن ظهورك في نتائج البحث المحلية",
    },
  ];

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">
        DialectIQ يحل كل هالمشاكل
      </h2>
      <p className="text-gray-500 text-center mb-10">
        أداة واحدة تفهم عميلك، ترد عليه، وتحمي سمعتك
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-cyan-200 transition-all group"
          >
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 mb-4 group-hover:bg-cyan-100 transition-colors">
              {f.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Before / After ─────────────── */
function BeforeAfter() {
  const ref = useReveal();
  return (
    <section ref={ref} className="max-w-4xl mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
        شاهد الفرق بنفسك
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Before */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <div className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-xs">✗</span>
            بدون DialectIQ
          </div>
          <div className="bg-white rounded-lg p-4 mb-3 border border-red-100">
            <div className="flex gap-1 mb-2">
              {[1, 2].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              {[3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 text-gray-300" />
              ))}
            </div>
            <p className="text-sm text-gray-700 mb-1">
              &quot;والله حيل زعلان. الطلب تأخر ساعة وما أحد رد&quot;
            </p>
            <p className="text-xs text-gray-400">أحمد — قبل 3 أيام</p>
          </div>
          <div className="text-center text-sm text-red-400 font-medium py-3">
            ❌ لا يوجد رد — مر 3 أيام
          </div>
        </div>

        {/* After */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
          <div className="text-sm font-bold text-emerald-600 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-xs">✓</span>
            مع DialectIQ
          </div>
          <div className="bg-white rounded-lg p-4 mb-3 border border-emerald-100">
            <div className="flex gap-1 mb-2">
              {[1, 2].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              {[3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 text-gray-300" />
              ))}
            </div>
            <p className="text-sm text-gray-700 mb-1">
              &quot;والله حيل زعلان. الطلب تأخر ساعة وما أحد رد&quot;
            </p>
            <p className="text-xs text-gray-400">أحمد — قبل 30 ثانية</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium mb-1">↩ رد DialectIQ:</p>
            <p className="text-sm text-gray-700">
              &quot;حياك الله أخوي أحمد، والله نعتذر لك أشد الاعتذار. ما يرضينا تنتظر كل هالوقت. حددنا المشكلة مع فريق التوصيل. نبغى نعوّضك — راسلنا على الخاص وطلبك القادم علينا!&quot;
            </p>
            <p className="text-xs text-emerald-500 mt-2">✅ رد خلال 30 ثانية — بلهجة العميل</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Pricing ─────────────── */
function Pricing() {
  const ref = useReveal();
  const plans = [
    {
      name: "الأساسية",
      price: "500",
      features: ["نشاط تجاري واحد", "500 تقييم / شهر", "تحليل مشاعر + لهجات", "ردود ذكية تلقائية", "تقارير أسبوعية"],
      popular: false,
    },
    {
      name: "المتقدمة",
      price: "1,500",
      features: ["5 أنشطة تجارية", "2,000 تقييم / شهر", "كل مميزات الأساسية", "تنبيهات فورية", "تقارير مفصّلة يومية", "أولوية دعم"],
      popular: true,
    },
    {
      name: "المؤسسات",
      price: "2,500",
      features: ["أنشطة غير محدودة", "تقييمات غير محدودة", "كل مميزات المتقدمة", "مدير حساب مخصص", "تكامل API", "تدريب الفريق"],
      popular: false,
    },
  ];

  return (
    <section ref={ref} id="pricing" className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">
        باقات تناسب حجم عملك
      </h2>
      <p className="text-gray-500 text-center mb-10">
        ابدأ بالتجربة المجانية 7 أيام — ثم اختر الباقة المناسبة
      </p>
      <div className="grid sm:grid-cols-3 gap-5">
        {plans.map((p, i) => (
          <div
            key={i}
            className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
              p.popular
                ? "border-cyan-500 shadow-xl shadow-cyan-500/10 scale-[1.02]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-l from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                الأكثر طلباً
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 mb-2">{p.name}</h3>
            <div className="mb-5">
              <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
              <span className="text-sm text-gray-500 mr-1">ريال / شهر</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {p.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              onClick={() =>
                trackEvent("Lead", { content_name: `pricing_${p.name}` })
              }
              className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${
                p.popular
                  ? "bg-gradient-to-l from-cyan-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-cyan-500/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              ابدأ تجربتك المجانية
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── FAQ ─────────────── */
function FAQ() {
  const ref = useReveal();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: "هل التجربة المجانية فعلاً بدون بطاقة؟",
      a: "نعم 100%. سجّل بإيميلك وابدأ فوراً. ما نطلب بيانات دفع إلا بعد ما تختار الاشتراك.",
    },
    {
      q: "هل يفهم النظام لهجتي؟",
      a: "DialectIQ مبني خصيصاً للسوق السعودي. يفهم النجدي، الحجازي، الشرقي، والعربيزي — ويكشف السخرية والتهكم.",
    },
    {
      q: "كم يأخذ وقت التفعيل؟",
      a: "دقائق فقط. سجّل، اربط حسابك في قوقل للأعمال، والنظام يبدأ يحلل تقييماتك فوراً.",
    },
    {
      q: "هل الردود تنشر تلقائياً ولا أراجعها أولاً؟",
      a: "أنت تتحكم. النظام يصيغ الرد ويعرضه عليك — أنت تراجع وتنشر بضغطة زر. ما ينشر شيء بدون موافقتك.",
    },
    {
      q: "وش يصير بعد 7 أيام؟",
      a: "تختار باقة تناسبك أو تلغي الاشتراك. ما فيه التزام أو رسوم مخفية.",
    },
  ];

  return (
    <section ref={ref} className="max-w-3xl mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
        أسئلة شائعة
      </h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <button
            key={i}
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full bg-white rounded-xl border border-gray-200 p-5 text-start hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-gray-900 text-sm">{f.q}</h3>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </div>
            {open === i && (
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                {f.a}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── Final CTA ─────────────── */
function FinalCTA() {
  return (
    <section className="bg-gradient-to-bl from-slate-900 via-slate-800 to-cyan-900 text-white py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          كل يوم تتأخر = عملاء تخسرهم
        </h2>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          منافسك اللي يرد على تقييماته بسرعة ياخذ عملائك. لا تنتظر — جرّب
          DialectIQ الحين وشاهد الفرق بنفسك.
        </p>
        <Link
          href="/register"
          onClick={() =>
            trackEvent("Lead", { content_name: "final_cta" })
          }
          className="inline-flex items-center gap-2 px-12 py-4 bg-white text-gray-900 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-colors shadow-2xl"
        >
          ابدأ تجربتك المجانية الآن
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <p className="text-sm text-gray-400 mt-4">
          7 أيام مجاناً • بدون بطاقة ائتمانية • إلغاء بأي وقت
        </p>
      </div>
    </section>
  );
}

/* ─────────────── Sticky Mobile CTA ─────────────── */
function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-white/90 backdrop-blur-xl border-t border-gray-200 p-3">
      <Link
        href="/register"
        onClick={() => trackEvent("Lead", { content_name: "sticky_mobile" })}
        className="block w-full text-center py-3.5 bg-gradient-to-l from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20"
      >
        ابدأ مجاناً — 7 أيام تجربة
      </Link>
    </div>
  );
}
