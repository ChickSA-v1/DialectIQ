// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'DialectIQ';

  @override
  String get login => 'تسجيل الدخول';

  @override
  String get register => 'إنشاء حساب';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get loginButton => 'دخول';

  @override
  String get noAccount => 'ليس لديك حساب؟';

  @override
  String get registerNow => 'سجل الآن';

  @override
  String get haveAccount => 'لديك حساب بالفعل؟';

  @override
  String get loginNow => 'سجل دخولك';

  @override
  String get logout => 'تسجيل الخروج';

  @override
  String get logoutConfirm => 'هل أنت متأكد من تسجيل الخروج؟';

  @override
  String get cancel => 'إلغاء';

  @override
  String get confirm => 'تأكيد';

  @override
  String get yes => 'نعم';

  @override
  String get no => 'لا';

  @override
  String get ok => 'حسناً';

  @override
  String get error => 'خطأ';

  @override
  String get success => 'نجاح';

  @override
  String get loading => 'جاري التحميل...';

  @override
  String get retry => 'إعادة المحاولة';

  @override
  String get next => 'التالي';

  @override
  String get back => 'رجوع';

  @override
  String get submit => 'إرسال';

  @override
  String get save => 'حفظ';

  @override
  String get settings => 'الإعدادات';

  @override
  String get language => 'اللغة';

  @override
  String get arabic => 'العربية';

  @override
  String get english => 'English';

  @override
  String get profile => 'الملف الشخصي';

  @override
  String get fullName => 'الاسم الكامل';

  @override
  String get phone => 'الهاتف';

  @override
  String get role => 'الدور';

  @override
  String get status => 'الحالة';

  @override
  String get regStepBusiness => 'معلومات النشاط';

  @override
  String get regStepPackage => 'اختر الباقة';

  @override
  String get regStepDocuments => 'رفع المستندات';

  @override
  String get regStepSuccess => 'تم!';

  @override
  String get businessNameAr => 'اسم النشاط (عربي)';

  @override
  String get businessNameEn => 'اسم النشاط (إنجليزي)';

  @override
  String get ownerName => 'اسم المالك';

  @override
  String get ownerPhone => 'رقم الهاتف';

  @override
  String get ownerEmail => 'البريد الإلكتروني';

  @override
  String get createPassword => 'إنشاء كلمة المرور';

  @override
  String get confirmPassword => 'تأكيد كلمة المرور';

  @override
  String get passwordMismatch => 'كلمات المرور غير متطابقة';

  @override
  String get requiredField => 'هذا الحقل مطلوب';

  @override
  String get invalidEmail => 'يرجى إدخال بريد إلكتروني صحيح';

  @override
  String get packageBasic => 'أساسي';

  @override
  String get packageAdvanced => 'متقدم';

  @override
  String get packageEnterprise => 'مؤسسات';

  @override
  String get sarMonth => 'ريال/شهر';

  @override
  String maxBusinesses(int count) {
    return 'حتى $count أنشطة تجارية';
  }

  @override
  String maxReviews(int count) {
    return 'حتى $count تقييم/شهر';
  }

  @override
  String get uploadCommercialReg => 'رفع السجل التجاري';

  @override
  String get uploadNationalId => 'رفع الهوية الوطنية';

  @override
  String get selectFile => 'اختر ملف';

  @override
  String fileSelected(String name) {
    return 'تم اختيار: $name';
  }

  @override
  String get allowedFormats => 'PDF, JPG, PNG (حد أقصى 10 ميجا)';

  @override
  String get regSuccess => 'تم إرسال التسجيل!';

  @override
  String get regSuccessMsg =>
      'طلب تسجيلك قيد المراجعة. سيتم إشعارك عبر البريد الإلكتروني عند الموافقة.';

  @override
  String get goToLogin => 'الذهاب لتسجيل الدخول';

  @override
  String get statusPending => 'قيد المراجعة';

  @override
  String get statusPendingMsg =>
      'تسجيلك قيد المراجعة حالياً من قبل فريقنا. سيتم إشعارك عبر البريد عند الموافقة.';

  @override
  String get statusRejected => 'تم رفض التسجيل';

  @override
  String get statusRejectedMsg => 'للأسف، تم رفض طلب التسجيل الخاص بك.';

  @override
  String rejectionReason(String reason) {
    return 'السبب: $reason';
  }

  @override
  String get contactSupport => 'تواصل مع الدعم';

  @override
  String get paymentRequired => 'الدفع مطلوب';

  @override
  String get paymentRequiredMsg =>
      'تمت الموافقة على حسابك! يرجى إتمام الدفع لتفعيل اشتراكك.';

  @override
  String get payWithCard => 'الدفع بالبطاقة';

  @override
  String get payWithBankTransfer => 'الدفع بالتحويل البنكي';

  @override
  String get uploadReceipt => 'رفع إيصال التحويل';

  @override
  String get receiptUploaded => 'تم رفع الإيصال بنجاح. سنتحقق من دفعتك قريباً.';

  @override
  String get paymentSuccess => 'تم الدفع بنجاح!';

  @override
  String get paymentSuccessMsg => 'اشتراكك مفعّل الآن. مرحباً بك في DialectIQ!';

  @override
  String get paymentFailed => 'فشل الدفع';

  @override
  String get paymentFailedMsg =>
      'حدث خطأ في عملية الدفع. يرجى المحاولة مرة أخرى.';

  @override
  String get goToDashboard => 'الذهاب للوحة التحكم';

  @override
  String get dashboard => 'لوحة التحكم';

  @override
  String get totalReviews => 'إجمالي التقييمات';

  @override
  String get avgSentiment => 'متوسط المشاعر';

  @override
  String get avgRating => 'متوسط التقييم';

  @override
  String get positive => 'إيجابي';

  @override
  String get negative => 'سلبي';

  @override
  String get neutral => 'محايد';

  @override
  String get reviews => 'التقييمات';

  @override
  String get noReviews => 'لا توجد تقييمات بعد';

  @override
  String get fetchReviews => 'جلب التقييمات';

  @override
  String get fetchingReviews => 'جاري جلب التقييمات...';

  @override
  String reviewsFetched(int count) {
    return 'تم جلب وتحليل $count تقييمات جديدة!';
  }

  @override
  String get urgency => 'الأولوية';

  @override
  String get urgencyHigh => 'عالية';

  @override
  String get urgencyMedium => 'متوسطة';

  @override
  String get urgencyLow => 'منخفضة';

  @override
  String get category => 'التصنيف';

  @override
  String get dialect => 'اللهجة';

  @override
  String get sentiment => 'المشاعر';

  @override
  String get suggestedReply => 'الرد المقترح';

  @override
  String get translatedIntent => 'القصد المترجم';

  @override
  String get businessName => 'اسم النشاط';

  @override
  String get filterBy => 'تصفية حسب';

  @override
  String get clearFilters => 'مسح الفلاتر';

  @override
  String get search => 'بحث';

  @override
  String page(int current, int total) {
    return 'صفحة $current من $total';
  }

  @override
  String get apiKey => 'مفتاح API';

  @override
  String get copyApiKey => 'نسخ مفتاح API';

  @override
  String get apiKeyCopied => 'تم نسخ مفتاح API';

  @override
  String get placeIds => 'معرفات الأنشطة التجارية';

  @override
  String get addBusiness => 'إضافة نشاط تجاري';

  @override
  String get searchPlaces => 'البحث في خرائط جوجل';

  @override
  String get noPlaces => 'لم تتم إضافة أنشطة بعد';

  @override
  String get subscription => 'الاشتراك';

  @override
  String get package => 'الباقة';

  @override
  String reviewsUsed(int used, int total) {
    return '$used من $total تقييم مستخدم';
  }

  @override
  String get urgencyBreakdown => 'توزيع الأولوية';

  @override
  String get categoryBreakdown => 'توزيع التصنيفات';

  @override
  String get dialectBreakdown => 'توزيع اللهجات';

  @override
  String get bankDetails => 'تفاصيل التحويل البنكي';

  @override
  String get bankName => 'البنك: بنك الإنماء';

  @override
  String get iban => 'آيبان: SA0405000068207124593000';

  @override
  String get accountHolder =>
      'صاحب الحساب: شركة داتاويف للاتصالات وتقنية المعلومات';

  @override
  String get transferRef => 'المرجع: بريدك الإلكتروني';

  @override
  String get pendingApproval => 'بانتظار الموافقة';

  @override
  String get businessPendingMsg => 'تم الإرسال لموافقة الإدارة';

  @override
  String get pendingPlaceIds => 'طلبات الأنشطة المعلقة';

  @override
  String get deleteAccount => 'حذف الحساب';

  @override
  String get deleteAccountDesc => 'حذف حسابك وجميع بياناتك نهائياً';

  @override
  String get deleteAccountConfirm =>
      'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك وتقييماتك ومستنداتك وسجل المدفوعات نهائياً.';

  @override
  String get deleteAccountButton => 'حذف نهائي';

  @override
  String get deleteAccountSuccess => 'تم حذف حسابك بنجاح';

  @override
  String get deleteReasonTitle => 'لماذا تريد حذف حسابك؟';

  @override
  String get deleteReasonNotUseful => 'التطبيق غير مفيد لنشاطي التجاري';

  @override
  String get deleteReasonTooExpensive => 'الأسعار مرتفعة جداً';

  @override
  String get deleteReasonSwitchingService => 'سأنتقل إلى خدمة أخرى';

  @override
  String get deleteReasonPrivacyConcerns =>
      'لدي مخاوف تتعلق بالخصوصية أو البيانات';

  @override
  String get deleteReasonTechnicalIssues => 'واجهت مشاكل تقنية';

  @override
  String get deleteReasonOther => 'سبب آخر';

  @override
  String get deleteReasonOtherHint => 'يرجى إخبارنا بالسبب...';

  @override
  String get deleteReasonRequired => 'يرجى اختيار سبب للمتابعة';

  @override
  String get upgradePackage => 'ترقية الباقة';

  @override
  String get upgradePackageDesc => 'افتح المزيد من الأنشطة التجارية والتقييمات';

  @override
  String get upgradeTitle => 'ترقية خطتك';

  @override
  String get upgradeSubtitle => 'اختر باقتك الجديدة للحصول على مزايا أكثر';

  @override
  String get currentPackage => 'الحالية';

  @override
  String upgradeButton(String package) {
    return 'ترقية إلى $package';
  }

  @override
  String get upgradePaymentTitle => 'دفع الترقية';

  @override
  String upgradePaymentMsg(String package) {
    return 'أتم الدفع لترقية اشتراكك إلى $package.';
  }

  @override
  String get upgradeSuccess => 'تمت ترقية الباقة!';

  @override
  String upgradeSuccessMsg(String package) {
    return 'تمت ترقية اشتراكك إلى $package. استمتع بالحدود الجديدة!';
  }

  @override
  String get upgradeNotAvailable => 'أنت على أعلى باقة';

  @override
  String get forgotPassword => 'نسيت كلمة المرور';

  @override
  String get forgotPasswordLink => 'نسيت كلمة المرور؟';

  @override
  String get forgotPasswordMsg =>
      'أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.';

  @override
  String get sendResetCode => 'إرسال رمز التحقق';

  @override
  String get enterResetCode => 'أدخل الرمز';

  @override
  String get enterResetCodeMsg =>
      'أرسلنا رمزاً مكوناً من 6 أرقام إلى بريدك الإلكتروني. يرجى إدخاله أدناه.';

  @override
  String get resetCode => 'رمز التحقق';

  @override
  String get resetCodeInvalid => 'الرمز يجب أن يكون 6 أرقام';

  @override
  String get verifyCode => 'تحقق من الرمز';

  @override
  String get resendCode => 'لم تستلم الرمز؟ أرسل مرة أخرى';

  @override
  String get newPassword => 'كلمة المرور الجديدة';

  @override
  String get newPasswordMsg => 'أنشئ كلمة مرور جديدة لحسابك.';

  @override
  String get passwordTooShort => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';

  @override
  String get resetPasswordButton => 'إعادة تعيين كلمة المرور';

  @override
  String get resetPasswordSuccess => 'تم تغيير كلمة المرور!';

  @override
  String get resetPasswordSuccessMsg =>
      'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.';
}
