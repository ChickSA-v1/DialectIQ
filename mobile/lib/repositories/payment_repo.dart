import 'dart:io';
import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/payment.dart';

class PaymentRepository {
  final Dio _dio = dioClient;

  /// Initiate card payment checkout via HyperPay
  Future<CheckoutResponse> checkout() async {
    final response = await _dio.post('/api/v1/payments/checkout');
    return CheckoutResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Check payment status
  Future<PaymentStatusResponse> paymentStatus(String invoiceId) async {
    final response = await _dio.get('/api/v1/payments/status/$invoiceId');
    return PaymentStatusResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Submit bank transfer receipt
  Future<BankTransferResponse> bankTransfer(File receiptFile, String invoiceId) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        receiptFile.path,
        filename: receiptFile.path.split('/').last,
      ),
      'invoice_id': invoiceId,
    });
    final response = await _dio.post(
      '/api/v1/payments/bank-transfer',
      data: formData,
    );
    return BankTransferResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Request a subscription upgrade
  Future<UpgradeResponse> requestUpgrade(String targetPackage) async {
    final response = await _dio.post(
      '/api/v1/payments/upgrade',
      data: {'target_package': targetPackage},
    );
    return UpgradeResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
