import 'dart:io';
import 'dart:ui';
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
import '../../widgets/animated_glass_background.dart';
import '../../widgets/fade_slide_in.dart';
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
    final checkout =
        await ref.read(paymentProvider.notifier).initiateCheckout();
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
      backgroundColor: AppColors.bgStart,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(l10n.appName),
        actions: [
          const LocaleSwitcher(),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: AnimatedGlassBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Header
              FadeSlideIn(
                child: GlassCard(
                child: Column(
                  children: [
                    Container(
                      width: 68,
                      height: 68,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.accentStart.withValues(alpha: 0.25),
                            AppColors.accentEnd.withValues(alpha: 0.12),
                          ],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color:
                                AppColors.accentStart.withValues(alpha: 0.20),
                            blurRadius: 20,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.payment_rounded,
                        size: 36,
                        color: Colors.white,
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
              ),

              const SizedBox(height: 24),

              // Card payment
              FadeSlideIn(
                delay: const Duration(milliseconds: 150),
                child: GradientButton(
                label: l10n.payWithCard,
                icon: Icons.credit_card,
                isLoading: payment.isLoading,
                onPressed: _payWithCard,
              ),
              ),

              const SizedBox(height: 16),

              // Divider
              FadeSlideIn(
                delay: const Duration(milliseconds: 250),
                child: Row(
                children: [
                  Expanded(
                      child: Divider(
                          color: Colors.white.withValues(alpha: 0.10))),
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
                  Expanded(
                      child: Divider(
                          color: Colors.white.withValues(alpha: 0.10))),
                ],
              ),
              ),

              const SizedBox(height: 16),

              // Bank transfer details
              FadeSlideIn(
                delay: const Duration(milliseconds: 350),
                child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: AppColors.glassDecoration(radius: 20),
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
                ),
              ),
              ),

              const SizedBox(height: 16),

              // Upload receipt
              FadeSlideIn(
                delay: const Duration(milliseconds: 450),
                child: GestureDetector(
                onTap: _pickReceipt,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: _receiptFile != null
                            ? AppColors.success.withValues(alpha: 0.08)
                            : Colors.white.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _receiptFile != null
                              ? AppColors.success.withValues(alpha: 0.30)
                              : Colors.white.withValues(alpha: 0.15),
                        ),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            _receiptFile != null
                                ? Icons.check_circle
                                : Icons.cloud_upload_outlined,
                            size: 36,
                            color: _receiptFile != null
                                ? AppColors.success
                                : AppColors.textMuted,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _receiptFile != null
                                ? l10n.fileSelected(
                                    _receiptFile!.path.split('/').last)
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
                    color: AppColors.error.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.error.withValues(alpha: 0.30),
                    ),
                  ),
                  child: Text(
                    payment.error!,
                    style:
                        const TextStyle(color: AppColors.error, fontSize: 13),
                  ),
                ),
              ],
            ],
          ),
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
              style: const TextStyle(
                  fontSize: 13, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
