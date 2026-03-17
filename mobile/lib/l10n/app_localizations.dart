import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'DialectIQ'**
  String get appName;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @register.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get register;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @loginButton.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get loginButton;

  /// No description provided for @noAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get noAccount;

  /// No description provided for @registerNow.
  ///
  /// In en, this message translates to:
  /// **'Register Now'**
  String get registerNow;

  /// No description provided for @haveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get haveAccount;

  /// No description provided for @loginNow.
  ///
  /// In en, this message translates to:
  /// **'Login Now'**
  String get loginNow;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @logoutConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to logout?'**
  String get logoutConfirm;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @yes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// No description provided for @no.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// No description provided for @ok.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// No description provided for @error.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get error;

  /// No description provided for @success.
  ///
  /// In en, this message translates to:
  /// **'Success'**
  String get success;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @submit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get submit;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @arabic.
  ///
  /// In en, this message translates to:
  /// **'العربية'**
  String get arabic;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @fullName.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get fullName;

  /// No description provided for @phone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get phone;

  /// No description provided for @role.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get role;

  /// No description provided for @status.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get status;

  /// No description provided for @regStepBusiness.
  ///
  /// In en, this message translates to:
  /// **'Business Info'**
  String get regStepBusiness;

  /// No description provided for @regStepPackage.
  ///
  /// In en, this message translates to:
  /// **'Select Package'**
  String get regStepPackage;

  /// No description provided for @regStepDocuments.
  ///
  /// In en, this message translates to:
  /// **'Upload Documents'**
  String get regStepDocuments;

  /// No description provided for @regStepSuccess.
  ///
  /// In en, this message translates to:
  /// **'Done!'**
  String get regStepSuccess;

  /// No description provided for @businessNameAr.
  ///
  /// In en, this message translates to:
  /// **'Business Name (Arabic)'**
  String get businessNameAr;

  /// No description provided for @businessNameEn.
  ///
  /// In en, this message translates to:
  /// **'Business Name (English)'**
  String get businessNameEn;

  /// No description provided for @ownerName.
  ///
  /// In en, this message translates to:
  /// **'Owner Name'**
  String get ownerName;

  /// No description provided for @ownerPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get ownerPhone;

  /// No description provided for @ownerEmail.
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get ownerEmail;

  /// No description provided for @createPassword.
  ///
  /// In en, this message translates to:
  /// **'Create Password'**
  String get createPassword;

  /// No description provided for @confirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get confirmPassword;

  /// No description provided for @passwordMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get passwordMismatch;

  /// No description provided for @requiredField.
  ///
  /// In en, this message translates to:
  /// **'This field is required'**
  String get requiredField;

  /// No description provided for @invalidEmail.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email'**
  String get invalidEmail;

  /// No description provided for @packageBasic.
  ///
  /// In en, this message translates to:
  /// **'Basic'**
  String get packageBasic;

  /// No description provided for @packageAdvanced.
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get packageAdvanced;

  /// No description provided for @packageEnterprise.
  ///
  /// In en, this message translates to:
  /// **'Enterprise'**
  String get packageEnterprise;

  /// No description provided for @sarMonth.
  ///
  /// In en, this message translates to:
  /// **'SAR/month'**
  String get sarMonth;

  /// No description provided for @maxBusinesses.
  ///
  /// In en, this message translates to:
  /// **'Up to {count} businesses'**
  String maxBusinesses(int count);

  /// No description provided for @maxReviews.
  ///
  /// In en, this message translates to:
  /// **'Up to {count} reviews/month'**
  String maxReviews(int count);

  /// No description provided for @uploadCommercialReg.
  ///
  /// In en, this message translates to:
  /// **'Upload Commercial Registration'**
  String get uploadCommercialReg;

  /// No description provided for @uploadNationalId.
  ///
  /// In en, this message translates to:
  /// **'Upload National ID'**
  String get uploadNationalId;

  /// No description provided for @selectFile.
  ///
  /// In en, this message translates to:
  /// **'Select File'**
  String get selectFile;

  /// No description provided for @fileSelected.
  ///
  /// In en, this message translates to:
  /// **'File selected: {name}'**
  String fileSelected(String name);

  /// No description provided for @allowedFormats.
  ///
  /// In en, this message translates to:
  /// **'PDF, JPG, PNG (max 10MB)'**
  String get allowedFormats;

  /// No description provided for @regSuccess.
  ///
  /// In en, this message translates to:
  /// **'Registration Submitted!'**
  String get regSuccess;

  /// No description provided for @regSuccessMsg.
  ///
  /// In en, this message translates to:
  /// **'Your registration is under review. You will receive an email once it\'s approved.'**
  String get regSuccessMsg;

  /// No description provided for @goToLogin.
  ///
  /// In en, this message translates to:
  /// **'Go to Login'**
  String get goToLogin;

  /// No description provided for @statusPending.
  ///
  /// In en, this message translates to:
  /// **'Under Review'**
  String get statusPending;

  /// No description provided for @statusPendingMsg.
  ///
  /// In en, this message translates to:
  /// **'Your registration is currently being reviewed by our team. You will receive an email once approved.'**
  String get statusPendingMsg;

  /// No description provided for @statusRejected.
  ///
  /// In en, this message translates to:
  /// **'Registration Rejected'**
  String get statusRejected;

  /// No description provided for @statusRejectedMsg.
  ///
  /// In en, this message translates to:
  /// **'Unfortunately, your registration was rejected.'**
  String get statusRejectedMsg;

  /// No description provided for @rejectionReason.
  ///
  /// In en, this message translates to:
  /// **'Reason: {reason}'**
  String rejectionReason(String reason);

  /// No description provided for @contactSupport.
  ///
  /// In en, this message translates to:
  /// **'Contact Support'**
  String get contactSupport;

  /// No description provided for @paymentRequired.
  ///
  /// In en, this message translates to:
  /// **'Payment Required'**
  String get paymentRequired;

  /// No description provided for @paymentRequiredMsg.
  ///
  /// In en, this message translates to:
  /// **'Your account has been approved! Please complete the payment to activate your subscription.'**
  String get paymentRequiredMsg;

  /// No description provided for @payWithCard.
  ///
  /// In en, this message translates to:
  /// **'Pay with Card'**
  String get payWithCard;

  /// No description provided for @payWithBankTransfer.
  ///
  /// In en, this message translates to:
  /// **'Pay with Bank Transfer'**
  String get payWithBankTransfer;

  /// No description provided for @uploadReceipt.
  ///
  /// In en, this message translates to:
  /// **'Upload Transfer Receipt'**
  String get uploadReceipt;

  /// No description provided for @receiptUploaded.
  ///
  /// In en, this message translates to:
  /// **'Receipt uploaded successfully. We\'ll verify your payment shortly.'**
  String get receiptUploaded;

  /// No description provided for @paymentSuccess.
  ///
  /// In en, this message translates to:
  /// **'Payment Successful!'**
  String get paymentSuccess;

  /// No description provided for @paymentSuccessMsg.
  ///
  /// In en, this message translates to:
  /// **'Your subscription is now active. Welcome to DialectIQ!'**
  String get paymentSuccessMsg;

  /// No description provided for @paymentFailed.
  ///
  /// In en, this message translates to:
  /// **'Payment Failed'**
  String get paymentFailed;

  /// No description provided for @paymentFailedMsg.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong with your payment. Please try again.'**
  String get paymentFailedMsg;

  /// No description provided for @goToDashboard.
  ///
  /// In en, this message translates to:
  /// **'Go to Dashboard'**
  String get goToDashboard;

  /// No description provided for @dashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get dashboard;

  /// No description provided for @totalReviews.
  ///
  /// In en, this message translates to:
  /// **'Total Reviews'**
  String get totalReviews;

  /// No description provided for @avgSentiment.
  ///
  /// In en, this message translates to:
  /// **'Avg Sentiment'**
  String get avgSentiment;

  /// No description provided for @avgRating.
  ///
  /// In en, this message translates to:
  /// **'Avg Rating'**
  String get avgRating;

  /// No description provided for @positive.
  ///
  /// In en, this message translates to:
  /// **'Positive'**
  String get positive;

  /// No description provided for @negative.
  ///
  /// In en, this message translates to:
  /// **'Negative'**
  String get negative;

  /// No description provided for @neutral.
  ///
  /// In en, this message translates to:
  /// **'Neutral'**
  String get neutral;

  /// No description provided for @reviews.
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get reviews;

  /// No description provided for @noReviews.
  ///
  /// In en, this message translates to:
  /// **'No reviews yet'**
  String get noReviews;

  /// No description provided for @fetchReviews.
  ///
  /// In en, this message translates to:
  /// **'Fetch Reviews'**
  String get fetchReviews;

  /// No description provided for @fetchingReviews.
  ///
  /// In en, this message translates to:
  /// **'Fetching reviews...'**
  String get fetchingReviews;

  /// No description provided for @reviewsFetched.
  ///
  /// In en, this message translates to:
  /// **'{count} new reviews fetched and analyzed!'**
  String reviewsFetched(int count);

  /// No description provided for @urgency.
  ///
  /// In en, this message translates to:
  /// **'Urgency'**
  String get urgency;

  /// No description provided for @urgencyHigh.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get urgencyHigh;

  /// No description provided for @urgencyMedium.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get urgencyMedium;

  /// No description provided for @urgencyLow.
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get urgencyLow;

  /// No description provided for @category.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// No description provided for @dialect.
  ///
  /// In en, this message translates to:
  /// **'Dialect'**
  String get dialect;

  /// No description provided for @sentiment.
  ///
  /// In en, this message translates to:
  /// **'Sentiment'**
  String get sentiment;

  /// No description provided for @suggestedReply.
  ///
  /// In en, this message translates to:
  /// **'Suggested Reply'**
  String get suggestedReply;

  /// No description provided for @translatedIntent.
  ///
  /// In en, this message translates to:
  /// **'Translated Intent'**
  String get translatedIntent;

  /// No description provided for @businessName.
  ///
  /// In en, this message translates to:
  /// **'Business Name'**
  String get businessName;

  /// No description provided for @filterBy.
  ///
  /// In en, this message translates to:
  /// **'Filter by'**
  String get filterBy;

  /// No description provided for @clearFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear Filters'**
  String get clearFilters;

  /// No description provided for @search.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// No description provided for @page.
  ///
  /// In en, this message translates to:
  /// **'Page {current} of {total}'**
  String page(int current, int total);

  /// No description provided for @apiKey.
  ///
  /// In en, this message translates to:
  /// **'API Key'**
  String get apiKey;

  /// No description provided for @copyApiKey.
  ///
  /// In en, this message translates to:
  /// **'Copy API Key'**
  String get copyApiKey;

  /// No description provided for @apiKeyCopied.
  ///
  /// In en, this message translates to:
  /// **'API Key copied to clipboard'**
  String get apiKeyCopied;

  /// No description provided for @placeIds.
  ///
  /// In en, this message translates to:
  /// **'Business Place IDs'**
  String get placeIds;

  /// No description provided for @addBusiness.
  ///
  /// In en, this message translates to:
  /// **'Add Business'**
  String get addBusiness;

  /// No description provided for @searchPlaces.
  ///
  /// In en, this message translates to:
  /// **'Search Google Places'**
  String get searchPlaces;

  /// No description provided for @noPlaces.
  ///
  /// In en, this message translates to:
  /// **'No businesses added yet'**
  String get noPlaces;

  /// No description provided for @subscription.
  ///
  /// In en, this message translates to:
  /// **'Subscription'**
  String get subscription;

  /// No description provided for @package.
  ///
  /// In en, this message translates to:
  /// **'Package'**
  String get package;

  /// No description provided for @reviewsUsed.
  ///
  /// In en, this message translates to:
  /// **'{used} of {total} reviews used'**
  String reviewsUsed(int used, int total);

  /// No description provided for @subscriptionUsage.
  ///
  /// In en, this message translates to:
  /// **'Subscription Usage'**
  String get subscriptionUsage;

  /// No description provided for @daysRemaining.
  ///
  /// In en, this message translates to:
  /// **'Days Remaining'**
  String get daysRemaining;

  /// No description provided for @reviewsRemaining.
  ///
  /// In en, this message translates to:
  /// **'Reviews Remaining'**
  String get reviewsRemaining;

  /// No description provided for @daysRemainingOf.
  ///
  /// In en, this message translates to:
  /// **'{remaining} of {total} days'**
  String daysRemainingOf(int remaining, int total);

  /// No description provided for @reviewsRemainingOf.
  ///
  /// In en, this message translates to:
  /// **'{remaining} of {total} reviews'**
  String reviewsRemainingOf(int remaining, int total);

  /// No description provided for @urgencyBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Urgency Breakdown'**
  String get urgencyBreakdown;

  /// No description provided for @categoryBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Category Breakdown'**
  String get categoryBreakdown;

  /// No description provided for @dialectBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Dialect Breakdown'**
  String get dialectBreakdown;

  /// No description provided for @bankDetails.
  ///
  /// In en, this message translates to:
  /// **'Bank Transfer Details'**
  String get bankDetails;

  /// No description provided for @bankName.
  ///
  /// In en, this message translates to:
  /// **'Bank: Alinma Bank'**
  String get bankName;

  /// No description provided for @iban.
  ///
  /// In en, this message translates to:
  /// **'IBAN: SA0405000068207124593000'**
  String get iban;

  /// No description provided for @accountHolder.
  ///
  /// In en, this message translates to:
  /// **'Account Holder: DataWeave ICT Co.'**
  String get accountHolder;

  /// No description provided for @transferRef.
  ///
  /// In en, this message translates to:
  /// **'Reference: Your email address'**
  String get transferRef;

  /// No description provided for @pendingApproval.
  ///
  /// In en, this message translates to:
  /// **'Pending Approval'**
  String get pendingApproval;

  /// No description provided for @businessPendingMsg.
  ///
  /// In en, this message translates to:
  /// **'Submitted for admin approval'**
  String get businessPendingMsg;

  /// No description provided for @pendingPlaceIds.
  ///
  /// In en, this message translates to:
  /// **'Pending Business Requests'**
  String get pendingPlaceIds;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get deleteAccount;

  /// No description provided for @deleteAccountDesc.
  ///
  /// In en, this message translates to:
  /// **'Permanently delete your account and all data'**
  String get deleteAccountDesc;

  /// No description provided for @deleteAccountConfirm.
  ///
  /// In en, this message translates to:
  /// **'This action is irreversible. All your data, reviews, documents, and payment history will be permanently deleted.'**
  String get deleteAccountConfirm;

  /// No description provided for @deleteAccountButton.
  ///
  /// In en, this message translates to:
  /// **'Delete Permanently'**
  String get deleteAccountButton;

  /// No description provided for @deleteAccountSuccess.
  ///
  /// In en, this message translates to:
  /// **'Your account has been deleted successfully'**
  String get deleteAccountSuccess;

  /// No description provided for @deleteReasonTitle.
  ///
  /// In en, this message translates to:
  /// **'Why are you leaving?'**
  String get deleteReasonTitle;

  /// No description provided for @deleteReasonNotUseful.
  ///
  /// In en, this message translates to:
  /// **'The app is not useful for my business'**
  String get deleteReasonNotUseful;

  /// No description provided for @deleteReasonTooExpensive.
  ///
  /// In en, this message translates to:
  /// **'The pricing is too expensive'**
  String get deleteReasonTooExpensive;

  /// No description provided for @deleteReasonSwitchingService.
  ///
  /// In en, this message translates to:
  /// **'I\'m switching to another service'**
  String get deleteReasonSwitchingService;

  /// No description provided for @deleteReasonPrivacyConcerns.
  ///
  /// In en, this message translates to:
  /// **'I have privacy or data concerns'**
  String get deleteReasonPrivacyConcerns;

  /// No description provided for @deleteReasonTechnicalIssues.
  ///
  /// In en, this message translates to:
  /// **'I experienced technical issues'**
  String get deleteReasonTechnicalIssues;

  /// No description provided for @deleteReasonOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get deleteReasonOther;

  /// No description provided for @deleteReasonOtherHint.
  ///
  /// In en, this message translates to:
  /// **'Please tell us why...'**
  String get deleteReasonOtherHint;

  /// No description provided for @deleteReasonRequired.
  ///
  /// In en, this message translates to:
  /// **'Please select a reason to continue'**
  String get deleteReasonRequired;

  /// No description provided for @upgradePackage.
  ///
  /// In en, this message translates to:
  /// **'Upgrade Package'**
  String get upgradePackage;

  /// No description provided for @upgradePackageDesc.
  ///
  /// In en, this message translates to:
  /// **'Unlock more businesses and reviews'**
  String get upgradePackageDesc;

  /// No description provided for @upgradeTitle.
  ///
  /// In en, this message translates to:
  /// **'Upgrade Your Plan'**
  String get upgradeTitle;

  /// No description provided for @upgradeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Select your new package to unlock more features'**
  String get upgradeSubtitle;

  /// No description provided for @currentPackage.
  ///
  /// In en, this message translates to:
  /// **'Current'**
  String get currentPackage;

  /// No description provided for @upgradeButton.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to {package}'**
  String upgradeButton(String package);

  /// No description provided for @upgradePaymentTitle.
  ///
  /// In en, this message translates to:
  /// **'Upgrade Payment'**
  String get upgradePaymentTitle;

  /// No description provided for @upgradePaymentMsg.
  ///
  /// In en, this message translates to:
  /// **'Complete the payment to upgrade your subscription to {package}.'**
  String upgradePaymentMsg(String package);

  /// No description provided for @upgradeSuccess.
  ///
  /// In en, this message translates to:
  /// **'Package Upgraded!'**
  String get upgradeSuccess;

  /// No description provided for @upgradeSuccessMsg.
  ///
  /// In en, this message translates to:
  /// **'Your subscription has been upgraded to {package}. Enjoy the new limits!'**
  String upgradeSuccessMsg(String package);

  /// No description provided for @upgradeNotAvailable.
  ///
  /// In en, this message translates to:
  /// **'You are on the highest package'**
  String get upgradeNotAvailable;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password'**
  String get forgotPassword;

  /// No description provided for @forgotPasswordLink.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPasswordLink;

  /// No description provided for @forgotPasswordMsg.
  ///
  /// In en, this message translates to:
  /// **'Enter your email address and we\'ll send you a verification code to reset your password.'**
  String get forgotPasswordMsg;

  /// No description provided for @sendResetCode.
  ///
  /// In en, this message translates to:
  /// **'Send Reset Code'**
  String get sendResetCode;

  /// No description provided for @enterResetCode.
  ///
  /// In en, this message translates to:
  /// **'Enter Code'**
  String get enterResetCode;

  /// No description provided for @enterResetCodeMsg.
  ///
  /// In en, this message translates to:
  /// **'We\'ve sent a 6-digit code to your email. Please enter it below.'**
  String get enterResetCodeMsg;

  /// No description provided for @resetCode.
  ///
  /// In en, this message translates to:
  /// **'Verification Code'**
  String get resetCode;

  /// No description provided for @resetCodeInvalid.
  ///
  /// In en, this message translates to:
  /// **'Code must be 6 digits'**
  String get resetCodeInvalid;

  /// No description provided for @verifyCode.
  ///
  /// In en, this message translates to:
  /// **'Verify Code'**
  String get verifyCode;

  /// No description provided for @resendCode.
  ///
  /// In en, this message translates to:
  /// **'Didn\'t receive the code? Send again'**
  String get resendCode;

  /// No description provided for @newPassword.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get newPassword;

  /// No description provided for @newPasswordMsg.
  ///
  /// In en, this message translates to:
  /// **'Create a new password for your account.'**
  String get newPasswordMsg;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get passwordTooShort;

  /// No description provided for @resetPasswordButton.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPasswordButton;

  /// No description provided for @resetPasswordSuccess.
  ///
  /// In en, this message translates to:
  /// **'Password Reset!'**
  String get resetPasswordSuccess;

  /// No description provided for @resetPasswordSuccessMsg.
  ///
  /// In en, this message translates to:
  /// **'Your password has been reset successfully. You can now login with your new password.'**
  String get resetPasswordSuccessMsg;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
