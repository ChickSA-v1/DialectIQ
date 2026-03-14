import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dialectiq/l10n/app_localizations.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/theme.dart';
import '../../core/constants.dart';
import '../../providers/payment_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/gradient_button.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/locale_switcher.dart';

class PaymentView extends ConsumerStatefulWidget {
  const PaymentView({super.key});

  @override
  ConsumerState<PaymentView> createState() => _PaymentViewState();
}

class _PaymentViewState extends ConsumerState<PaymentView> {
  File? _receiptFile;

  Future<void> _payWithCard() async {
    final checkout = await ref.read(paymentProvider.notifier).initiateCheckout();
    if (checkout != null && mounted) {
      // Open HyperPay checkout in external browser
      final uri = Uri.parse(checkout.redirectUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
      // After returning, check status
      if (mounted) {
        context.push('/payment-result?invoice_id=${checkout.invoiceId}');
      }
    }
  }

  Future<void> _pickReceipt() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: allowedExtensions,
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _receiptFile = File(result.files.single.path!);
      });
    }
  }

  Future<void> _submitBankTransfer() async {
    if (_receiptFile == null) return;

    final result = await ref
        .read(paymentProvider.notifier)
        .submitBankTransfer(_receiptFile!);

    if (result != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!.receiptUploaded),
          backgroundColor: AppColors.success,
        ),
      );
      // Refresh profile to update status
      ref.read(authProvider.notifier).refreshProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final payment = ref.watch(paymentProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.appName),
        actions: [
          const LocaleSwitcher(),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Header
            GlassCard(
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.payment_rounded,
                      size: 36,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    l10n.paymentRequired,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    l10n.paymentRequiredMsg,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Card payment
            GradientButton(
              label: l10n.payWithCard,
              icon: Icons.credit_card,
              isLoading: payment.isLoading,
              onPressed: _payWithCard,
            ),

            const SizedBox(height: 16),

            // Divider
            Row(
              children: [
                const Expanded(child: Divider()),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'OR',
                    style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Expanded(child: Divider()),
              ],
            ),

            const SizedBox(height: 16),

            // Bank transfer details
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.bankDetails,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _bankInfoRow(Icons.account_balance, l10n.bankName),
                  _bankInfoRow(Icons.numbers, l10n.iban),
                  _bankInfoRow(Icons.person, l10n.accountHolder),
                  _bankInfoRow(Icons.tag, l10n.transferRef),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Upload receipt
            GestureDetector(
              onTap: _pickReceipt,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _receiptFile != null ? AppColors.success : AppColors.border,
                  ),
                ),
                child: Column(
                  children: [
                    Icon(
                      _receiptFile != null
                          ? Icons.check_circle
                          : Icons.cloud_upload_outlined,
                      size: 36,
                      color:
                          _receiptFile != null ? AppColors.success : AppColors.textMuted,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _receiptFile != null
                          ? l10n.fileSelected(_receiptFile!.path.split('/').last)
                          : l10n.uploadReceipt,
                      style: TextStyle(
                        color: _receiptFile != null
                            ? AppColors.success
                            : AppColors.textSecondary,
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            if (_receiptFile != null)
              GradientButton(
                label: l10n.submit,
                icon: Icons.send,
                isLoading: payment.isLoading,
                onPressed: _submitBankTransfer,
              ),

            // Error
            if (payment.error != null) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  payment.error!,
                  style: const TextStyle(color: AppColors.error, fontSize: 13),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _bankInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
