import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../app/theme.dart';
import '../providers/payment_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/gradient_button.dart';

class PaymentResultScreen extends ConsumerStatefulWidget {
  final String invoiceId;

  const PaymentResultScreen({super.key, required this.invoiceId});

  @override
  ConsumerState<PaymentResultScreen> createState() => _PaymentResultScreenState();
}

class _PaymentResultScreenState extends ConsumerState<PaymentResultScreen> {
  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    await ref.read(paymentProvider.notifier).checkStatus(widget.invoiceId);
    // Also refresh profile
    ref.read(authProvider.notifier).refreshProfile();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final payment = ref.watch(paymentProvider);

    if (payment.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final isPaid = payment.status?.status == 'paid';

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: (isPaid ? AppColors.success : AppColors.error)
                        .withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isPaid ? Icons.check_circle : Icons.error,
                    size: 48,
                    color: isPaid ? AppColors.success : AppColors.error,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  isPaid ? l10n.paymentSuccess : l10n.paymentFailed,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  isPaid ? l10n.paymentSuccessMsg : l10n.paymentFailedMsg,
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 36),
                GradientButton(
                  label: isPaid ? l10n.goToDashboard : l10n.retry,
                  icon: isPaid ? Icons.dashboard : Icons.refresh,
                  onPressed: () {
                    if (isPaid) {
                      context.go('/client');
                    } else {
                      context.pop();
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
