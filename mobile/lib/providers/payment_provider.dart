import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/payment.dart';
import '../repositories/payment_repo.dart';

/// Payment state
class PaymentState {
  final bool isLoading;
  final String? error;
  final CheckoutResponse? checkout;
  final PaymentStatusResponse? status;
  final BankTransferResponse? bankTransfer;
  final UpgradeResponse? upgrade;

  const PaymentState({
    this.isLoading = false,
    this.error,
    this.checkout,
    this.status,
    this.bankTransfer,
    this.upgrade,
  });

  PaymentState copyWith({
    bool? isLoading,
    String? error,
    CheckoutResponse? checkout,
    PaymentStatusResponse? status,
    BankTransferResponse? bankTransfer,
    UpgradeResponse? upgrade,
  }) =>
      PaymentState(
        isLoading: isLoading ?? this.isLoading,
        error: error,
        checkout: checkout ?? this.checkout,
        status: status ?? this.status,
        bankTransfer: bankTransfer ?? this.bankTransfer,
        upgrade: upgrade ?? this.upgrade,
      );
}

class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentRepository _repo = PaymentRepository();

  PaymentNotifier() : super(const PaymentState());

  /// Initiate card payment
  Future<CheckoutResponse?> initiateCheckout() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final checkout = await _repo.checkout();
      state = state.copyWith(isLoading: false, checkout: checkout);
      return checkout;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return null;
    }
  }

  /// Check payment status
  Future<PaymentStatusResponse?> checkStatus(String invoiceId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final status = await _repo.paymentStatus(invoiceId);
      state = state.copyWith(isLoading: false, status: status);
      return status;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return null;
    }
  }

  /// Submit bank transfer receipt
  Future<BankTransferResponse?> submitBankTransfer(File receipt, String invoiceId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repo.bankTransfer(receipt, invoiceId);
      state = state.copyWith(isLoading: false, bankTransfer: result);
      return result;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return null;
    }
  }

  /// Request subscription upgrade
  Future<UpgradeResponse?> requestUpgrade(String targetPackage) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repo.requestUpgrade(targetPackage);
      state = state.copyWith(isLoading: false, upgrade: result);
      return result;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _extractError(e));
      return null;
    }
  }

  void reset() {
    state = const PaymentState();
  }

  /// Extract a clean, user-friendly error message from exceptions
  String _extractError(dynamic e) {
    if (e is DioException && e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map && data.containsKey('detail')) {
        return data['detail'].toString();
      }
    }
    if (e is DioException) {
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timed out. Please try again.';
        case DioExceptionType.connectionError:
          return 'No internet connection.';
        default:
          break;
      }
    }
    if (e is Exception) {
      final str = e.toString();
      if (str.contains('detail')) {
        final match = RegExp(r'"detail"\s*:\s*"([^"]+)"').firstMatch(str);
        if (match != null) return match.group(1)!;
      }
    }
    return 'An unexpected error occurred';
  }
}

final paymentProvider =
    StateNotifierProvider<PaymentNotifier, PaymentState>(
  (ref) => PaymentNotifier(),
);
