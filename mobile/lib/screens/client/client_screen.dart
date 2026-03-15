import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/profile_provider.dart';
import '../../widgets/animated_glass_background.dart';
import 'pending_view.dart';
import 'rejected_view.dart';
import 'payment_view.dart';
import 'active_dashboard.dart';

class ClientScreen extends ConsumerStatefulWidget {
  const ClientScreen({super.key});

  @override
  ConsumerState<ClientScreen> createState() => _ClientScreenState();
}

class _ClientScreenState extends ConsumerState<ClientScreen> {
  @override
  void initState() {
    super.initState();
    // Refresh profile to get latest status
    Future.microtask(() {
      ref.read(authProvider.notifier).refreshProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final tenant = ref.watch(tenantProvider);

    if (auth.isLoading) {
      return Scaffold(
        backgroundColor: AppColors.bgStart,
        body: AnimatedGlassBackground(
          child: Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation(
                AppColors.accentStart.withValues(alpha: 0.7),
              ),
            ),
          ),
        ),
      );
    }

    final status = tenant?.status ?? 'pending_review';
    final latestInvoice = tenant?.latestInvoiceStatus;

    // Determine which view to show based on tenant status
    if (status == 'active') {
      return const ActiveDashboard();
    }
    if (status == 'rejected') {
      return RejectedView(
        reason: tenant?.rejectionReason,
      );
    }
    // approved but needs payment
    if (status == 'approved' ||
        (status == 'payment_pending') ||
        (latestInvoice == 'pending' ||
            latestInvoice == null && status != 'pending_review')) {
      return const PaymentView();
    }
    // default: pending review
    return const PendingView();
  }
}
