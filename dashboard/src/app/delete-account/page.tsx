export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">DialectIQ</h1>
          <p className="text-gray-500 text-sm mt-1">طلب حذف الحساب</p>
        </div>

        {/* Arabic */}
        <div className="mb-8" dir="rtl">
          <h2 className="text-lg font-bold text-gray-800 mb-4">كيف تطلب حذف حسابك؟</h2>
          <ol className="space-y-3 text-gray-600 text-sm list-decimal list-inside">
            <li>أرسل بريد إلكتروني إلى <strong>support@d-iq.io</strong></li>
            <li>اكتب في الموضوع: <strong>طلب حذف الحساب</strong></li>
            <li>اذكر البريد الإلكتروني المسجل بحسابك</li>
            <li>سنعالج طلبك خلال <strong>7 أيام عمل</strong></li>
          </ol>

          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-700 font-medium mb-2">⚠️ البيانات التي سيتم حذفها:</p>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
              <li>معلومات الحساب (الاسم، البريد الإلكتروني، كلمة المرور)</li>
              <li>بيانات المتجر والتقييمات المحللة</li>
              <li>إعدادات الاشتراك والفريق</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 font-medium mb-2">📋 البيانات التي نحتفظ بها:</p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>سجلات الفواتير لمدة 5 سنوات (متطلبات قانونية)</li>
            </ul>
          </div>
        </div>

        <hr className="my-6" />

        {/* English */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">How to request account deletion?</h2>
          <ol className="space-y-3 text-gray-600 text-sm list-decimal list-inside">
            <li>Send an email to <strong>support@d-iq.io</strong></li>
            <li>Subject: <strong>Account Deletion Request</strong></li>
            <li>Include the email address linked to your account</li>
            <li>We will process your request within <strong>7 business days</strong></li>
          </ol>

          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-700 font-medium mb-2">⚠️ Data that will be deleted:</p>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
              <li>Account info (name, email, password)</li>
              <li>Business data and analyzed reviews</li>
              <li>Subscription and team settings</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 font-medium mb-2">📋 Data we retain:</p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>Invoice records for 5 years (legal requirements)</li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-6">
          <a
            href="mailto:support@d-iq.io?subject=Account%20Deletion%20Request"
            className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors text-sm"
          >
            Request Account Deletion — طلب حذف الحساب
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 DialectIQ · <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}
