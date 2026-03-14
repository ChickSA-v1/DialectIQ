import 'dart:io';
import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/payment.dart';

class PaymentRepository {
  final Dio _dio = dioClient;

  /// Initiate card payment checkout via HyperPay
  Future<CheckoutResponse> checkout() async {
    final response = await _dio.post('/payment/checkout');
    return CheckoutResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Check payment status
  Future<PaymentStatusResponse> paymentStatus(String invoiceId) async {
    final response = await _dio.get('/payment/status/$invoiceId');
    return PaymentStatusResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// Submit bank transfer receipt
  Future<BankTransferResponse> bankTransfer(File receiptFile) async {
    final formData = FormData.fromMap({
      'receipt': await MultipartFile.fromFile(
        receiptFile.path,
        filename: receiptFile.path.split('/').last,
      ),
    });
    final response = await _dio.post(
      '/payment/bank-transfer',
      data: formData,
    );
    return BankTransferResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
