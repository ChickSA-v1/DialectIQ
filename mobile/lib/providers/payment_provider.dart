import 'dart:io';
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

  const PaymentState({
    this.isLoading = false,
    this.error,
    this.checkout,
    this.status,
    this.bankTransfer,
  });

  PaymentState copyWith({
    bool? isLoading,
    String? error,
    CheckoutResponse? checkout,
    PaymentStatusResponse? status,
    BankTransferResponse? bankTransfer,
  }) =>
      PaymentState(
        isLoading: isLoading ?? this.isLoading,
        error: error,
        checkout: checkout ?? this.checkout,
        status: status ?? this.status,
        bankTransfer: bankTransfer ?? this.bankTransfer,
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
      state = state.copyWith(isLoading: false, error: e.toString());
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
      state = state.copyWith(isLoading: false, error: e.toString());
      return null;
    }
  }

  /// Submit bank transfer receipt
  Future<BankTransferResponse?> submitBankTransfer(File receipt) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repo.bankTransfer(receipt);
      state = state.copyWith(isLoading: false, bankTransfer: result);
      return result;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return null;
    }
  }

  void reset() {
    state = const PaymentState();
  }
}

final paymentProvider =
    StateNotifierProvider<PaymentNotifier, PaymentState>(
  (ref) => PaymentNotifier(),
);
