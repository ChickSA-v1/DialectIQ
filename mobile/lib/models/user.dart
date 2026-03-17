/// User-related models mirroring API schemas

class LoginResponse {
  final String accessToken;
  final String tokenType;
  final String role;
  final String? tenantId;
  final String? tenantStatus;

  LoginResponse({
    required this.accessToken,
    this.tokenType = 'bearer',
    required this.role,
    this.tenantId,
    this.tenantStatus,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
    accessToken: json['access_token'] as String,
    tokenType: json['token_type'] as String? ?? 'bearer',
    role: json['role'] as String,
    tenantId: json['tenant_id'] as String?,
    tenantStatus: json['tenant_status'] as String?,
  );
}

class UserProfile {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final bool isActive;
  final TenantInfo? tenant;
  final List<InvoiceInfo>? invoices;

  UserProfile({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.isActive,
    this.tenant,
    this.invoices,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
    id: json['id'] as String,
    email: json['email'] as String,
    fullName: json['full_name'] as String,
    role: json['role'] as String,
    isActive: json['is_active'] as bool,
    tenant: json['tenant'] != null
        ? TenantInfo.fromJson(json['tenant'] as Map<String, dynamic>)
        : null,
    invoices: (json['invoices'] as List<dynamic>?)
        ?.map((e) => InvoiceInfo.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

class TenantInfo {
  final String id;
  final String nameAr;
  final String? nameEn;
  final String email;
  final String phone;
  final String status;
  final String package;
  final List<String> placeIds;
  final List<String> pendingPlaceIds;
  final int maxBusinesses;
  final int maxReviewsPerMonth;
  final int reviewsUsedThisMonth;
  final String? apiKey;
  final String? rejectionReason;
  final String? latestInvoiceStatus;
  final bool cardPaymentEnabled;
  final String? subscriptionStartsAt;
  final String? subscriptionExpiresAt;
  final String? createdAt;

  TenantInfo({
    required this.id,
    required this.nameAr,
    this.nameEn,
    required this.email,
    required this.phone,
    required this.status,
    required this.package,
    required this.placeIds,
    this.pendingPlaceIds = const [],
    required this.maxBusinesses,
    required this.maxReviewsPerMonth,
    required this.reviewsUsedThisMonth,
    this.apiKey,
    this.rejectionReason,
    this.latestInvoiceStatus,
    this.cardPaymentEnabled = false,
    this.subscriptionStartsAt,
    this.subscriptionExpiresAt,
    this.createdAt,
  });

  factory TenantInfo.fromJson(Map<String, dynamic> json) => TenantInfo(
    id: json['id'] as String,
    nameAr: json['name_ar'] as String,
    nameEn: json['name_en'] as String?,
    email: json['email'] as String,
    phone: json['phone'] as String,
    status: json['status'] as String,
    package: json['package'] as String,
    placeIds: (json['place_ids'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
    pendingPlaceIds: (json['pending_place_ids'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
    maxBusinesses: json['max_businesses'] as int? ?? 1,
    maxReviewsPerMonth: json['max_reviews_per_month'] as int? ?? 500,
    reviewsUsedThisMonth: json['reviews_used_this_month'] as int? ?? 0,
    apiKey: json['api_key'] as String?,
    rejectionReason: json['rejection_reason'] as String?,
    latestInvoiceStatus: json['latest_invoice_status'] as String?,
    cardPaymentEnabled: json['card_payment_enabled'] as bool? ?? false,
    subscriptionStartsAt: json['subscription_starts_at'] as String?,
    subscriptionExpiresAt: json['subscription_expires_at'] as String?,
    createdAt: json['created_at'] as String?,
  );
}

class InvoiceInfo {
  final String id;
  final double amountSar;
  final String status;
  final String? hyperpayCheckoutId;
  final String? paymentMethod;
  final String? transferReceiptUrl;
  final String? transferReceiptName;
  final String? paidAt;
  final String? createdAt;

  InvoiceInfo({
    required this.id,
    required this.amountSar,
    required this.status,
    this.hyperpayCheckoutId,
    this.paymentMethod,
    this.transferReceiptUrl,
    this.transferReceiptName,
    this.paidAt,
    this.createdAt,
  });

  factory InvoiceInfo.fromJson(Map<String, dynamic> json) => InvoiceInfo(
    id: json['id'] as String,
    amountSar: (json['amount_sar'] as num).toDouble(),
    status: json['status'] as String,
    hyperpayCheckoutId: json['hyperpay_checkout_id'] as String?,
    paymentMethod: json['payment_method'] as String?,
    transferReceiptUrl: json['transfer_receipt_url'] as String?,
    transferReceiptName: json['transfer_receipt_name'] as String?,
    paidAt: json['paid_at'] as String?,
    createdAt: json['created_at'] as String?,
  );
}
