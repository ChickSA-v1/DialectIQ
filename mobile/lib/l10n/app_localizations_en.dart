// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'DialectIQ';

  @override
  String get login => 'Login';

  @override
  String get register => 'Register';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get loginButton => 'Sign In';

  @override
  String get noAccount => 'Don\'t have an account?';

  @override
  String get registerNow => 'Register Now';

  @override
  String get haveAccount => 'Already have an account?';

  @override
  String get loginNow => 'Login Now';

  @override
  String get logout => 'Logout';

  @override
  String get logoutConfirm => 'Are you sure you want to logout?';

  @override
  String get cancel => 'Cancel';

  @override
  String get confirm => 'Confirm';

  @override
  String get yes => 'Yes';

  @override
  String get no => 'No';

  @override
  String get ok => 'OK';

  @override
  String get error => 'Error';

  @override
  String get success => 'Success';

  @override
  String get loading => 'Loading...';

  @override
  String get retry => 'Retry';

  @override
  String get next => 'Next';

  @override
  String get back => 'Back';

  @override
  String get submit => 'Submit';

  @override
  String get save => 'Save';

  @override
  String get settings => 'Settings';

  @override
  String get language => 'Language';

  @override
  String get arabic => 'العربية';

  @override
  String get english => 'English';

  @override
  String get profile => 'Profile';

  @override
  String get fullName => 'Full Name';

  @override
  String get phone => 'Phone';

  @override
  String get role => 'Role';

  @override
  String get status => 'Status';

  @override
  String get regStepBusiness => 'Business Info';

  @override
  String get regStepPackage => 'Select Package';

  @override
  String get regStepDocuments => 'Upload Documents';

  @override
  String get regStepSuccess => 'Done!';

  @override
  String get businessNameAr => 'Business Name (Arabic)';

  @override
  String get businessNameEn => 'Business Name (English)';

  @override
  String get ownerName => 'Owner Name';

  @override
  String get ownerPhone => 'Phone Number';

  @override
  String get ownerEmail => 'Email Address';

  @override
  String get createPassword => 'Create Password';

  @override
  String get confirmPassword => 'Confirm Password';

  @override
  String get passwordMismatch => 'Passwords do not match';

  @override
  String get requiredField => 'This field is required';

  @override
  String get invalidEmail => 'Please enter a valid email';

  @override
  String get packageBasic => 'Basic';

  @override
  String get packageAdvanced => 'Advanced';

  @override
  String get packageEnterprise => 'Enterprise';

  @override
  String get sarMonth => 'SAR/month';

  @override
  String maxBusinesses(int count) {
    return 'Up to $count businesses';
  }

  @override
  String maxReviews(int count) {
    return 'Up to $count reviews/month';
  }

  @override
  String get uploadCommercialReg => 'Upload Commercial Registration';

  @override
  String get uploadNationalId => 'Upload National ID';

  @override
  String get selectFile => 'Select File';

  @override
  String fileSelected(String name) {
    return 'File selected: $name';
  }

  @override
  String get allowedFormats => 'PDF, JPG, PNG (max 10MB)';

  @override
  String get regSuccess => 'Your account is ready!';

  @override
  String get regSuccessMsg =>
      'You have a 7-day free trial. Sign in now to start analyzing your reviews.';

  @override
  String get goToLogin => 'Go to Login';

  @override
  String get statusPending => 'Under Review';

  @override
  String get statusPendingMsg =>
      'Your registration is currently being reviewed by our team. You will receive an email once approved.';

  @override
  String get statusRejected => 'Registration Rejected';

  @override
  String get statusRejectedMsg =>
      'Unfortunately, your registration was rejected.';

  @override
  String rejectionReason(String reason) {
    return 'Reason: $reason';
  }

  @override
  String get contactSupport => 'Contact Support';

  @override
  String get paymentRequired => 'Payment Required';

  @override
  String get paymentRequiredMsg =>
      'Your account has been approved! Please complete the payment to activate your subscription.';

  @override
  String get payWithCard => 'Pay with Card';

  @override
  String get payWithBankTransfer => 'Pay with Bank Transfer';

  @override
  String get uploadReceipt => 'Upload Transfer Receipt';

  @override
  String get receiptUploaded =>
      'Receipt uploaded successfully. We\'ll verify your payment shortly.';

  @override
  String get paymentSuccess => 'Payment Successful!';

  @override
  String get paymentSuccessMsg =>
      'Your subscription is now active. Welcome to DialectIQ!';

  @override
  String get paymentFailed => 'Payment Failed';

  @override
  String get paymentFailedMsg =>
      'Something went wrong with your payment. Please try again.';

  @override
  String get goToDashboard => 'Go to Dashboard';

  @override
  String get dashboard => 'Dashboard';

  @override
  String get totalReviews => 'Total Reviews';

  @override
  String get avgSentiment => 'Avg Sentiment';

  @override
  String get avgRating => 'Avg Rating';

  @override
  String get positive => 'Positive';

  @override
  String get negative => 'Negative';

  @override
  String get neutral => 'Neutral';

  @override
  String get reviews => 'Reviews';

  @override
  String get noReviews => 'No reviews yet';

  @override
  String get fetchReviews => 'Fetch Reviews';

  @override
  String get fetchingReviews => 'Fetching reviews...';

  @override
  String reviewsFetched(int count) {
    return '$count new reviews fetched and analyzed!';
  }

  @override
  String get urgency => 'Urgency';

  @override
  String get urgencyHigh => 'High';

  @override
  String get urgencyMedium => 'Medium';

  @override
  String get urgencyLow => 'Low';

  @override
  String get category => 'Category';

  @override
  String get dialect => 'Dialect';

  @override
  String get sentiment => 'Sentiment';

  @override
  String get suggestedReply => 'Suggested Reply';

  @override
  String get translatedIntent => 'Translated Intent';

  @override
  String get businessName => 'Business Name';

  @override
  String get filterBy => 'Filter by';

  @override
  String get clearFilters => 'Clear Filters';

  @override
  String get search => 'Search';

  @override
  String page(int current, int total) {
    return 'Page $current of $total';
  }

  @override
  String get apiKey => 'API Key';

  @override
  String get copyApiKey => 'Copy API Key';

  @override
  String get apiKeyCopied => 'API Key copied to clipboard';

  @override
  String get placeIds => 'Business Place IDs';

  @override
  String get addBusiness => 'Add Business';

  @override
  String get searchPlaces => 'Search Google Places';

  @override
  String get noPlaces => 'No businesses added yet';

  @override
  String get subscription => 'Subscription';

  @override
  String get package => 'Package';

  @override
  String reviewsUsed(int used, int total) {
    return '$used of $total reviews used';
  }

  @override
  String get subscriptionUsage => 'Subscription Usage';

  @override
  String get daysRemaining => 'Days Remaining';

  @override
  String get reviewsRemaining => 'Reviews Remaining';

  @override
  String daysRemainingOf(int remaining, int total) {
    return '$remaining of $total days';
  }

  @override
  String reviewsRemainingOf(int remaining, int total) {
    return '$remaining of $total reviews';
  }

  @override
  String get urgencyBreakdown => 'Urgency Breakdown';

  @override
  String get categoryBreakdown => 'Category Breakdown';

  @override
  String get dialectBreakdown => 'Dialect Breakdown';

  @override
  String get bankDetails => 'Bank Transfer Details';

  @override
  String get bankName => 'Bank: Alinma Bank';

  @override
  String get iban => 'IBAN: SA0405000068207124593000';

  @override
  String get accountHolder => 'Account Holder: DataWeave ICT Co.';

  @override
  String get transferRef => 'Reference: Your email address';

  @override
  String get pendingApproval => 'Pending Approval';

  @override
  String get businessPendingMsg => 'Submitted for admin approval';

  @override
  String get pendingPlaceIds => 'Pending Business Requests';

  @override
  String get deleteAccount => 'Delete Account';

  @override
  String get deleteAccountDesc =>
      'Permanently delete your account and all data';

  @override
  String get deleteAccountConfirm =>
      'This action is irreversible. All your data, reviews, documents, and payment history will be permanently deleted.';

  @override
  String get deleteAccountButton => 'Delete Permanently';

  @override
  String get deleteAccountSuccess =>
      'Your account has been deleted successfully';

  @override
  String get deleteReasonTitle => 'Why are you leaving?';

  @override
  String get deleteReasonNotUseful => 'The app is not useful for my business';

  @override
  String get deleteReasonTooExpensive => 'The pricing is too expensive';

  @override
  String get deleteReasonSwitchingService =>
      'I\'m switching to another service';

  @override
  String get deleteReasonPrivacyConcerns => 'I have privacy or data concerns';

  @override
  String get deleteReasonTechnicalIssues => 'I experienced technical issues';

  @override
  String get deleteReasonOther => 'Other';

  @override
  String get deleteReasonOtherHint => 'Please tell us why...';

  @override
  String get deleteReasonRequired => 'Please select a reason to continue';

  @override
  String get upgradePackage => 'Upgrade Package';

  @override
  String get upgradePackageDesc => 'Unlock more businesses and reviews';

  @override
  String get upgradeTitle => 'Upgrade Your Plan';

  @override
  String get upgradeSubtitle =>
      'Select your new package to unlock more features';

  @override
  String get currentPackage => 'Current';

  @override
  String upgradeButton(String package) {
    return 'Upgrade to $package';
  }

  @override
  String get upgradePaymentTitle => 'Upgrade Payment';

  @override
  String upgradePaymentMsg(String package) {
    return 'Complete the payment to upgrade your subscription to $package.';
  }

  @override
  String get upgradeSuccess => 'Package Upgraded!';

  @override
  String upgradeSuccessMsg(String package) {
    return 'Your subscription has been upgraded to $package. Enjoy the new limits!';
  }

  @override
  String get upgradeNotAvailable => 'You are on the highest package';

  @override
  String get forgotPassword => 'Forgot Password';

  @override
  String get forgotPasswordLink => 'Forgot Password?';

  @override
  String get forgotPasswordMsg =>
      'Enter your email address and we\'ll send you a verification code to reset your password.';

  @override
  String get sendResetCode => 'Send Reset Code';

  @override
  String get enterResetCode => 'Enter Code';

  @override
  String get enterResetCodeMsg =>
      'We\'ve sent a 6-digit code to your email. Please enter it below.';

  @override
  String get resetCode => 'Verification Code';

  @override
  String get resetCodeInvalid => 'Code must be 6 digits';

  @override
  String get verifyCode => 'Verify Code';

  @override
  String get resendCode => 'Didn\'t receive the code? Send again';

  @override
  String get newPassword => 'New Password';

  @override
  String get newPasswordMsg => 'Create a new password for your account.';

  @override
  String get passwordTooShort => 'Password must be at least 8 characters';

  @override
  String get resetPasswordButton => 'Reset Password';

  @override
  String get resetPasswordSuccess => 'Password Reset!';

  @override
  String get resetPasswordSuccessMsg =>
      'Your password has been reset successfully. You can now login with your new password.';
}
