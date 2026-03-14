/// Payment-related models

class CheckoutResponse {
  final String checkoutId;
  final String invoiceId;
  final String redirectUrl;

  CheckoutResponse({
    required this.checkoutId,
    required this.invoiceId,
    required this.redirectUrl,
  });

  factory CheckoutResponse.fromJson(Map<String, dynamic> json) =>
      CheckoutResponse(
        checkoutId: json['checkout_id'] as String,
        invoiceId: json['invoice_id'] as String,
        redirectUrl: json['redirect_url'] as String,
      );
}

class PaymentStatusResponse {
  final String invoiceId;
  final String status;
  final String? tenantStatus;
  final String? message;

  PaymentStatusResponse({
    required this.invoiceId,
    required this.status,
    this.tenantStatus,
    this.message,
  });

  factory PaymentStatusResponse.fromJson(Map<String, dynamic> json) =>
      PaymentStatusResponse(
        invoiceId: json['invoice_id'] as String,
        status: json['status'] as String,
        tenantStatus: json['tenant_status'] as String?,
        message: json['message'] as String?,
      );
}

class BankTransferResponse {
  final String invoiceId;
  final String status;
  final String message;

  BankTransferResponse({
    required this.invoiceId,
    required this.status,
    required this.message,
  });

  factory BankTransferResponse.fromJson(Map<String, dynamic> json) =>
      BankTransferResponse(
        invoiceId: json['invoice_id'] as String,
        status: json['status'] as String,
        message: json['message'] as String,
      );
}
