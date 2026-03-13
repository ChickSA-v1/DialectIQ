"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "ar";

const translations = {
  en: {
    // Header
    "app.title": "DialectIQ",
    "app.subtitle": "Saudi dialect-aware sentiment analysis",

    // Stats Cards
    "stats.totalReviews": "Total Reviews",
    "stats.avgSentiment": "Avg Sentiment",
    "stats.avgRating": "Avg Rating",
    "stats.highUrgency": "High Urgency",

    // Filter Bar
    "filter.businessName": "Business Name",
    "filter.searchPlaceholder": "Search businesses...",
    "filter.category": "Category",
    "filter.allCategories": "All Categories",
    "filter.urgency": "Urgency",
    "filter.allUrgencies": "All Urgencies",
    "filter.search": "Search",
    "filter.clear": "Clear",

    // Categories
    "cat.Pricing": "Pricing",
    "cat.Quality": "Quality",
    "cat.Customer Service": "Customer Service",
    "cat.Delivery": "Delivery",
    "cat.UX": "UX",
    "cat.Trust & Safety": "Trust & Safety",
    "cat.General": "General",
    "cat.User Experience": "User Experience",

    // Urgencies
    "urgency.High": "High",
    "urgency.Medium": "Medium",
    "urgency.Low": "Low",

    // Charts
    "chart.urgencyBreakdown": "Urgency Breakdown",
    "chart.categories": "Categories",
    "chart.dialectDistribution": "Dialect Distribution",
    "chart.noData": "No data",
    "chart.noAnalysis": "No analysis data yet. Send reviews through the API to see charts.",

    // Reviews section
    "reviews.title": "Reviews",
    "reviews.total": "total",
    "reviews.refresh": "Refresh",
    "reviews.noResults": "No reviews found. Adjust your filters or send reviews through the API.",
    "reviews.anonymous": "Anonymous",
    "reviews.showDetails": "Show intent & reply",
    "reviews.hideDetails": "Hide details",
    "reviews.translatedIntent": "Translated Intent",
    "reviews.suggestedReply": "Suggested Reply",

    // Pagination
    "pagination.page": "Page",
    "pagination.of": "of",

    // Error / Loading
    "error.title": "Failed to load dashboard",
    "error.retry": "Retry",
    "error.fallback": "Failed to load data",

    // Language
    "lang.switch": "العربية",

    // Dialects
    "dialect.Najdi": "Najdi",
    "dialect.Hijazi": "Hijazi",
    "dialect.Sharqi": "Sharqi",
    "dialect.MSA": "MSA",
    "dialect.Arabizi": "Arabizi",
    "dialect.Mixed": "Mixed",

    // Auth
    "auth.loginTitle": "Welcome Back",
    "auth.loginSubtitle": "Sign in to your DialectIQ account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.login": "Sign In",
    "auth.loggingIn": "Signing in...",
    "auth.loginFailed": "Login failed",
    "auth.noAccount": "Don't have an account?",
    "auth.registerHere": "Register here",

    // Register
    "register.title": "Create Account",
    "register.subtitle": "Register your business on DialectIQ",
    "register.businessInfo": "Business Information",
    "register.businessNameAr": "Business Name (Arabic)",
    "register.businessNameEn": "Business Name (English)",
    "register.fullName": "Full Name",
    "register.phone": "Phone Number",
    "register.passwordHint": "Minimum 8 characters",
    "register.next": "Next",
    "register.back": "Back",
    "register.haveAccount": "Already have an account?",
    "register.choosePackage": "Choose Your Package",
    "register.sarMonth": "SAR/month",
    "register.businesses": "businesses",
    "register.reviewsMonth": "reviews/month",
    "register.unlimitedBusinesses": "Unlimited businesses",
    "register.unlimitedReviews": "Unlimited reviews",
    "register.popular": "Popular",
    "register.submitRegistration": "Submit Registration",
    "register.submitting": "Submitting...",
    "register.uploadDocs": "Upload Documents",
    "register.uploadDocsDesc": "Upload your Commercial Registration and Owner ID for verification.",
    "register.commercialReg": "Commercial Registration (CR)",
    "register.ownerId": "Owner ID",
    "register.chooseFile": "Choose file (PDF, JPG, PNG)",
    "register.fileHint": "Max 10MB per file. Accepted: PDF, JPG, PNG",
    "register.uploadAndSubmit": "Upload & Submit",
    "register.uploading": "Uploading...",
    "register.bothDocsRequired": "Both documents are required",
    "register.successTitle": "Registration Submitted!",
    "register.successDesc": "Your registration is under review. We'll notify you once approved.",

    // Packages
    "package.basic": "Basic",
    "package.advanced": "Advanced",
    "package.enterprise": "Enterprise",

    // Admin
    "admin.panel": "Admin Panel",
    "admin.registrations": "Registrations",
    "admin.tenants": "Tenants",
    "admin.loading": "Loading...",
    "admin.logout": "Logout",
    "admin.noRegistrations": "No pending registrations",
    "admin.documents": "Documents",
    "admin.owner": "Owner",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    "admin.rejectReason": "Enter rejection reason...",
    "admin.confirmReject": "Confirm Rejection",
    "admin.cancel": "Cancel",
    "admin.noDocs": "No documents uploaded",
    "admin.allStatuses": "All Statuses",
    "admin.businessName": "Business Name",
    "admin.package": "Package",
    "admin.status": "Status",
    "admin.reviewsUsed": "Reviews Used",
    "admin.apiKey": "API Key",
    "admin.actions": "Actions",
    "admin.activate": "Activate",
    "admin.activated": "Tenant activated successfully",
    "admin.deactivate": "Deactivate",
    "admin.deactivated": "Tenant deactivated",
    "admin.reactivate": "Reactivate",
    "admin.reactivated": "Tenant reactivated",
    "admin.edit": "Edit",
    "admin.save": "Save",
    "admin.editTenant": "Edit Tenant",
    "admin.confirmDeactivate": "Are you sure you want to deactivate this tenant? Their API key will be revoked.",
    "admin.copied": "Copied!",
    "admin.noTenants": "No tenants found",
    "admin.nameAr": "Name (Arabic)",
    "admin.nameEn": "Name (English)",
    "admin.email": "Email",
    "admin.phone": "Phone",
    "admin.placeIds": "Place IDs",
    "admin.addPlaceId": "Add Place ID",
    "admin.removePlaceId": "Remove",
    "admin.searchBusiness": "Search business...",
    "admin.noPlaceIds": "No businesses assigned",
    "admin.placeIdAdded": "Business added",
    "admin.placeIdRemoved": "Business removed",

    // Tenant statuses
    "tenant.active": "Active",
    "tenant.approved": "Approved",
    "tenant.pending_review": "Pending Review",
    "tenant.rejected": "Rejected",
    "tenant.suspended": "Suspended",

    // Document types
    "document.commercial_registration": "Commercial Registration",
    "document.owner_id": "Owner ID",

    // Client dashboard
    "client.underReview": "Registration Under Review",
    "client.underReviewDesc": "Your registration is being reviewed by our team. You'll be notified once it's approved.",
    "client.rejected": "Registration Rejected",
    "client.rejectedDesc": "Unfortunately, your registration was not approved. Please contact support.",
    "client.paymentRequired": "Payment Required",
    "client.paymentRequiredDesc": "Your registration has been approved! Please complete payment to activate your account.",
    "client.contactAdmin": "Contact admin to complete payment setup",
    "client.apiKey": "Your API Key",
    "client.copy": "Copy",
    "client.reviewsUsed": "Reviews used this month",
    "client.placeIds": "Place IDs",
    "client.placeIdPlaceholder": "Enter Google Place ID (ChIJ...)",
    "client.addPlaceId": "Add Place ID",
    "client.searchBusiness": "Search for your business",
    "client.searchPlaceholder": "Type business name or paste Google Maps link...",
    "client.searching": "Searching...",
    "client.noResults": "No businesses found. Try a different name.",
    "client.selectBusiness": "Select",
    "client.rating": "Rating",
    "client.reviews": "reviews",
    "client.placeIdAdded": "Business added successfully!",
    "client.businessLimit": "Business limit reached for your package",
    "client.alreadyAdded": "Already added",
    "client.fetchReviews": "Fetch Reviews",
    "client.fetchingReviews": "Fetching & analyzing reviews...",
    "client.reviewsFetched": "reviews fetched",
    "client.newAnalyzed": "new analyzed",
    "client.noPlaceIds": "No businesses assigned yet. Your admin will add them for you.",
    "client.fetchSuccess": "Reviews fetched successfully!",

    // Payment
    "payment.payNow": "Pay Now",
    "payment.processing": "Processing...",
    "payment.invoiceAmount": "Invoice Amount",
    "payment.completePayment": "Complete your payment to activate your account",
    "payment.securePayment": "Secure payment via HyperPay",
    "payment.successTitle": "Payment Successful!",
    "payment.successDesc": "Your account has been activated. You can now access your dashboard.",
    "payment.failedTitle": "Payment Failed",
    "payment.failedDesc": "Something went wrong with your payment. Please try again.",
    "payment.tryAgain": "Try Again",
    "payment.backToDashboard": "Back to Dashboard",
    "payment.verifying": "Verifying payment...",
    "payment.status": "Payment",
    "payment.pending": "Pending",
    "payment.paid": "Paid",
    "payment.failed": "Failed",
    "payment.none": "—",

    // Insight explanations
    "insight.totalReviews": "Track how many customer reviews we've analyzed. More reviews mean stronger insights into what your customers really think.",
    "insight.avgSentiment": "How positively or negatively customers feel overall. Above 7 is excellent, 4\u20137 needs attention, below 4 is critical.",
    "insight.avgRating": "Your average Google star rating \u2014 the first thing potential customers see when finding your business online.",
    "insight.highUrgency": "Reviews needing immediate attention \u2014 complaints, safety issues, or serious dissatisfaction that could harm your reputation.",
    "insight.urgencyBreakdown": "Action Required",
    "insight.urgencyBreakdownDesc": "See how many reviews need immediate action vs. routine monitoring. A healthy business has mostly low-urgency reviews.",
    "insight.categories": "What Customers Talk About",
    "insight.categoriesDesc": "Know the topics customers mention most. Pricing dominant? Review your value. Quality leading? Focus on improvements.",
    "insight.dialectDistribution": "Where Your Customers Are From",
    "insight.dialectDistributionDesc": "Najdi = Central Saudi, Hijazi = Western, Sharqi = Eastern. Tailor your marketing and service to your real audience.",
    "insight.learnMore": "Why this matters",

    // Tutorial steps
    "tutorial.step1Title": "Your Key Metrics",
    "tutorial.step1Desc": "These four cards show your most important numbers \u2014 total reviews, customer sentiment, star rating, and urgent issues needing action.",
    "tutorial.step2Title": "Urgency Breakdown",
    "tutorial.step2Desc": "This chart shows how many reviews need immediate action. Address high-urgency reviews first to protect your reputation.",
    "tutorial.step3Title": "Category Analysis",
    "tutorial.step3Desc": "See what topics customers discuss most \u2014 pricing, quality, service, and more. Prioritize improvements where it matters.",
    "tutorial.step4Title": "Dialect Distribution",
    "tutorial.step4Desc": "Understand where your customers are from by their dialect. Tailor your marketing and service to your real audience.",
    "tutorial.step5Title": "Filter Your Data",
    "tutorial.step5Desc": "Narrow down reviews by business, category, or urgency. Perfect for focusing on specific areas that need attention.",
    "tutorial.step6Title": "Individual Reviews",
    "tutorial.step6Desc": "Each review shows AI-detected sentiment, category, and dialect. Expand to see translated intent and a ready-to-use suggested reply.",
    "tutorial.skip": "Skip tour",
    "tutorial.next": "Next",
    "tutorial.prev": "Previous",
    "tutorial.done": "Got it!",
    "tutorial.startTour": "Take a tour",
    "tutorial.help": "Help",

    // Section headers
    "section.overview": "Overview",
    "section.analytics": "Analytics",
    "section.reviews": "Customer Reviews",

    // Welcome banner
    "welcome.greeting": "Welcome back",
    "welcome.reviewsAcross": "reviews across",
    "welcome.businesses": "businesses",
    "welcome.takeTour": "Take a tour",

    // Review extras
    "review.copyReply": "Copy reply",
    "review.replyCopied": "Copied!",
  },
  ar: {
    // Header
    "app.title": "DialectIQ",
    "app.subtitle": "تحليل المشاعر بالهجات السعودية",

    // Stats Cards
    "stats.totalReviews": "إجمالي التقييمات",
    "stats.avgSentiment": "متوسط المشاعر",
    "stats.avgRating": "متوسط التقييم",
    "stats.highUrgency": "أولوية عالية",

    // Filter Bar
    "filter.businessName": "اسم المنشأة",
    "filter.searchPlaceholder": "ابحث عن منشأة...",
    "filter.category": "التصنيف",
    "filter.allCategories": "جميع التصنيفات",
    "filter.urgency": "الأولوية",
    "filter.allUrgencies": "جميع الأولويات",
    "filter.search": "بحث",
    "filter.clear": "مسح",

    // Categories
    "cat.Pricing": "التسعير",
    "cat.Quality": "الجودة",
    "cat.Customer Service": "خدمة العملاء",
    "cat.Delivery": "التوصيل",
    "cat.UX": "تجربة المستخدم",
    "cat.Trust & Safety": "الثقة والأمان",
    "cat.General": "عام",
    "cat.User Experience": "تجربة المستخدم",

    // Urgencies
    "urgency.High": "عالية",
    "urgency.Medium": "متوسطة",
    "urgency.Low": "منخفضة",

    // Charts
    "chart.urgencyBreakdown": "توزيع الأولويات",
    "chart.categories": "التصنيفات",
    "chart.dialectDistribution": "توزيع اللهجات",
    "chart.noData": "لا توجد بيانات",
    "chart.noAnalysis": "لا توجد بيانات تحليلية بعد. أرسل تقييمات عبر الـ API لرؤية الرسوم البيانية.",

    // Reviews section
    "reviews.title": "التقييمات",
    "reviews.total": "إجمالي",
    "reviews.refresh": "تحديث",
    "reviews.noResults": "لا توجد تقييمات. عدّل الفلاتر أو أرسل تقييمات عبر الـ API.",
    "reviews.anonymous": "مجهول",
    "reviews.showDetails": "عرض التحليل والرد",
    "reviews.hideDetails": "إخفاء التفاصيل",
    "reviews.translatedIntent": "ترجمة المعنى",
    "reviews.suggestedReply": "الرد المقترح",

    // Pagination
    "pagination.page": "صفحة",
    "pagination.of": "من",

    // Error / Loading
    "error.title": "فشل تحميل لوحة المعلومات",
    "error.retry": "إعادة المحاولة",
    "error.fallback": "فشل تحميل البيانات",

    // Language
    "lang.switch": "English",

    // Dialects
    "dialect.Najdi": "نجدي",
    "dialect.Hijazi": "حجازي",
    "dialect.Sharqi": "شرقي",
    "dialect.MSA": "فصحى",
    "dialect.Arabizi": "عربيزي",
    "dialect.Mixed": "مختلط",

    // Auth
    "auth.loginTitle": "مرحباً بعودتك",
    "auth.loginSubtitle": "سجل دخولك إلى حساب DialectIQ",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.login": "تسجيل الدخول",
    "auth.loggingIn": "جاري تسجيل الدخول...",
    "auth.loginFailed": "فشل تسجيل الدخول",
    "auth.noAccount": "ليس لديك حساب؟",
    "auth.registerHere": "سجل هنا",

    // Register
    "register.title": "إنشاء حساب",
    "register.subtitle": "سجل منشأتك في DialectIQ",
    "register.businessInfo": "معلومات المنشأة",
    "register.businessNameAr": "اسم المنشأة (عربي)",
    "register.businessNameEn": "اسم المنشأة (إنجليزي)",
    "register.fullName": "الاسم الكامل",
    "register.phone": "رقم الجوال",
    "register.passwordHint": "8 أحرف على الأقل",
    "register.next": "التالي",
    "register.back": "رجوع",
    "register.haveAccount": "لديك حساب بالفعل؟",
    "register.choosePackage": "اختر باقتك",
    "register.sarMonth": "ريال/شهر",
    "register.businesses": "منشآت",
    "register.reviewsMonth": "تقييم/شهر",
    "register.unlimitedBusinesses": "منشآت غير محدودة",
    "register.unlimitedReviews": "تقييمات غير محدودة",
    "register.popular": "الأكثر طلباً",
    "register.submitRegistration": "تقديم الطلب",
    "register.submitting": "جاري الإرسال...",
    "register.uploadDocs": "رفع المستندات",
    "register.uploadDocsDesc": "ارفع السجل التجاري وهوية المالك للتحقق.",
    "register.commercialReg": "السجل التجاري",
    "register.ownerId": "هوية المالك",
    "register.chooseFile": "اختر ملف (PDF، JPG، PNG)",
    "register.fileHint": "الحد الأقصى 10 ميقابايت لكل ملف. المقبول: PDF، JPG، PNG",
    "register.uploadAndSubmit": "رفع وإرسال",
    "register.uploading": "جاري الرفع...",
    "register.bothDocsRequired": "كلا المستندين مطلوبين",
    "register.successTitle": "تم تقديم الطلب!",
    "register.successDesc": "طلبك قيد المراجعة. سنخبرك فور الموافقة.",

    // Packages
    "package.basic": "أساسي",
    "package.advanced": "متقدم",
    "package.enterprise": "مؤسسات",

    // Admin
    "admin.panel": "لوحة الإدارة",
    "admin.registrations": "طلبات التسجيل",
    "admin.tenants": "المنشآت",
    "admin.loading": "جاري التحميل...",
    "admin.logout": "تسجيل الخروج",
    "admin.noRegistrations": "لا توجد طلبات تسجيل معلقة",
    "admin.documents": "المستندات",
    "admin.owner": "المالك",
    "admin.approve": "قبول",
    "admin.reject": "رفض",
    "admin.rejectReason": "اكتب سبب الرفض...",
    "admin.confirmReject": "تأكيد الرفض",
    "admin.cancel": "إلغاء",
    "admin.noDocs": "لم يتم رفع مستندات",
    "admin.allStatuses": "جميع الحالات",
    "admin.businessName": "اسم المنشأة",
    "admin.package": "الباقة",
    "admin.status": "الحالة",
    "admin.reviewsUsed": "التقييمات المستخدمة",
    "admin.apiKey": "مفتاح API",
    "admin.actions": "الإجراءات",
    "admin.activate": "تفعيل",
    "admin.activated": "تم تفعيل المنشأة بنجاح",
    "admin.deactivate": "إيقاف",
    "admin.deactivated": "تم إيقاف المنشأة",
    "admin.reactivate": "إعادة تفعيل",
    "admin.reactivated": "تمت إعادة تفعيل المنشأة",
    "admin.edit": "تعديل",
    "admin.save": "حفظ",
    "admin.editTenant": "تعديل المنشأة",
    "admin.confirmDeactivate": "هل أنت متأكد من إيقاف هذه المنشأة؟ سيتم إلغاء مفتاح API.",
    "admin.copied": "تم النسخ!",
    "admin.noTenants": "لا توجد منشآت",
    "admin.nameAr": "الاسم (عربي)",
    "admin.nameEn": "الاسم (إنجليزي)",
    "admin.email": "البريد الإلكتروني",
    "admin.phone": "رقم الجوال",
    "admin.placeIds": "المنشآت",
    "admin.addPlaceId": "إضافة منشأة",
    "admin.removePlaceId": "إزالة",
    "admin.searchBusiness": "ابحث عن منشأة...",
    "admin.noPlaceIds": "لم يتم تعيين منشآت",
    "admin.placeIdAdded": "تمت إضافة المنشأة",
    "admin.placeIdRemoved": "تمت إزالة المنشأة",

    // Tenant statuses
    "tenant.active": "نشط",
    "tenant.approved": "مقبول",
    "tenant.pending_review": "قيد المراجعة",
    "tenant.rejected": "مرفوض",
    "tenant.suspended": "موقوف",

    // Document types
    "document.commercial_registration": "السجل التجاري",
    "document.owner_id": "هوية المالك",

    // Client dashboard
    "client.underReview": "الطلب قيد المراجعة",
    "client.underReviewDesc": "طلب التسجيل قيد المراجعة من فريقنا. سنخبرك فور الموافقة.",
    "client.rejected": "تم رفض التسجيل",
    "client.rejectedDesc": "للأسف، لم تتم الموافقة على طلبك. يرجى التواصل مع الدعم.",
    "client.paymentRequired": "الدفع مطلوب",
    "client.paymentRequiredDesc": "تمت الموافقة على تسجيلك! يرجى إتمام الدفع لتفعيل حسابك.",
    "client.contactAdmin": "تواصل مع الإدارة لإتمام إعداد الدفع",
    "client.apiKey": "مفتاح API الخاص بك",
    "client.copy": "نسخ",
    "client.reviewsUsed": "التقييمات المستخدمة هذا الشهر",
    "client.placeIds": "معرفات الأماكن",
    "client.placeIdPlaceholder": "أدخل معرف المكان (ChIJ...)",
    "client.addPlaceId": "إضافة معرف المكان",
    "client.searchBusiness": "ابحث عن منشأتك",
    "client.searchPlaceholder": "اكتب اسم المنشأة أو الصق رابط خرائط قوقل...",
    "client.searching": "جاري البحث...",
    "client.noResults": "لم يتم العثور على منشآت. جرب اسماً مختلفاً.",
    "client.selectBusiness": "اختيار",
    "client.rating": "التقييم",
    "client.reviews": "تقييمات",
    "client.placeIdAdded": "تمت إضافة المنشأة بنجاح!",
    "client.businessLimit": "تم الوصول للحد الأقصى من المنشآت لباقتك",
    "client.alreadyAdded": "مضاف مسبقاً",
    "client.fetchReviews": "جلب التقييمات",
    "client.fetchingReviews": "جاري جلب وتحليل التقييمات...",
    "client.reviewsFetched": "تقييمات تم جلبها",
    "client.newAnalyzed": "جديدة تم تحليلها",
    "client.noPlaceIds": "لم يتم تعيين منشآت بعد. سيقوم المشرف بإضافتها لك.",
    "client.fetchSuccess": "تم جلب التقييمات بنجاح!",

    // Payment
    "payment.payNow": "ادفع الآن",
    "payment.processing": "جاري المعالجة...",
    "payment.invoiceAmount": "مبلغ الفاتورة",
    "payment.completePayment": "أكمل الدفع لتفعيل حسابك",
    "payment.securePayment": "دفع آمن عبر HyperPay",
    "payment.successTitle": "تم الدفع بنجاح!",
    "payment.successDesc": "تم تفعيل حسابك. يمكنك الآن الوصول إلى لوحة المعلومات.",
    "payment.failedTitle": "فشل الدفع",
    "payment.failedDesc": "حدث خطأ في عملية الدفع. يرجى المحاولة مرة أخرى.",
    "payment.tryAgain": "حاول مرة أخرى",
    "payment.backToDashboard": "العودة للوحة المعلومات",
    "payment.verifying": "جاري التحقق من الدفع...",
    "payment.status": "الدفع",
    "payment.pending": "معلق",
    "payment.paid": "مدفوع",
    "payment.failed": "فشل",
    "payment.none": "—",

    // Insight explanations
    "insight.totalReviews": "تتبع عدد تقييمات العملاء التي تم تحليلها. تقييمات أكثر تعني رؤى أقوى حول آراء عملائك.",
    "insight.avgSentiment": "يعكس مدى إيجابية أو سلبية مشاعر العملاء. فوق 7 ممتاز، 4-7 يحتاج اهتمام، أقل من 4 حرج.",
    "insight.avgRating": "متوسط تقييمك على قوقل \u2014 أول ما يراه العملاء المحتملون عند البحث عن منشأتك.",
    "insight.highUrgency": "تقييمات تحتاج اهتمام فوري \u2014 شكاوى أو مشاكل خطيرة قد تضر بسمعتك إن لم تُعالج بسرعة.",
    "insight.urgencyBreakdown": "الإجراءات المطلوبة",
    "insight.urgencyBreakdownDesc": "اعرف كم تقييم يحتاج تدخل فوري مقابل المتابعة الروتينية. المنشأة الصحية أغلب تقييماتها منخفضة الأولوية.",
    "insight.categories": "ما يتحدث عنه العملاء",
    "insight.categoriesDesc": "اعرف أكثر المواضيع التي يتحدث عنها عملاؤك. التسعير هو الأكثر؟ راجع عرض القيمة. الجودة تتصدر؟ ركز على التحسين.",
    "insight.dialectDistribution": "من أين عملاؤك",
    "insight.dialectDistributionDesc": "نجدي = وسط السعودية، حجازي = غرب، شرقي = شرق. يساعدك في توجيه التسويق لجمهورك الفعلي.",
    "insight.learnMore": "لماذا هذا مهم",

    // Tutorial steps
    "tutorial.step1Title": "مؤشراتك الرئيسية",
    "tutorial.step1Desc": "هذه البطاقات الأربع تعرض أهم أرقامك \u2014 إجمالي التقييمات، مشاعر العملاء، التقييم بالنجوم، والمسائل العاجلة.",
    "tutorial.step2Title": "توزيع الأولويات",
    "tutorial.step2Desc": "يوضح هذا الرسم عدد التقييمات التي تحتاج تدخل فوري. عالج التقييمات العاجلة أولاً لحماية سمعتك.",
    "tutorial.step3Title": "تحليل التصنيفات",
    "tutorial.step3Desc": "اعرف أكثر المواضيع التي يتحدث عنها عملاؤك \u2014 التسعير، الجودة، الخدمة. حدد أولويات التحسين.",
    "tutorial.step4Title": "توزيع اللهجات",
    "tutorial.step4Desc": "افهم من أين عملاؤك من خلال لهجتهم. وجّه تسويقك وخدمتك لجمهورك الحقيقي.",
    "tutorial.step5Title": "فلتر البيانات",
    "tutorial.step5Desc": "صفّي التقييمات حسب المنشأة أو التصنيف أو الأولوية. مثالي للتركيز على مجالات محددة.",
    "tutorial.step6Title": "التقييمات الفردية",
    "tutorial.step6Desc": "كل تقييم يعرض تحليل الذكاء الاصطناعي للمشاعر والتصنيف واللهجة. وسّعه لرؤية الترجمة والرد المقترح.",
    "tutorial.skip": "تخطي الجولة",
    "tutorial.next": "التالي",
    "tutorial.prev": "السابق",
    "tutorial.done": "فهمت!",
    "tutorial.startTour": "ابدأ الجولة",
    "tutorial.help": "مساعدة",

    // Section headers
    "section.overview": "نظرة عامة",
    "section.analytics": "التحليلات",
    "section.reviews": "تقييمات العملاء",

    // Welcome banner
    "welcome.greeting": "مرحباً بعودتك",
    "welcome.reviewsAcross": "تقييم عبر",
    "welcome.businesses": "منشآت",
    "welcome.takeTour": "ابدأ الجولة",

    // Review extras
    "review.copyReply": "نسخ الرد",
    "review.replyCopied": "تم النسخ!",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("dialectiq-lang") as Locale) || "en";
    }
    return "en";
  });

  const dir = locale === "ar" ? "rtl" : "ltr";

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? key;
    },
    [locale],
  );

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("dialectiq-lang", newLocale);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
