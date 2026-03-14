import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../../app/theme.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/locale_switcher.dart';

class RejectedView extends StatelessWidget {
  final String? reason;

  const RejectedView({super.key, this.reason});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

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
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: GlassCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.cancel_rounded,
                    size: 40,
                    color: AppColors.error,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  l10n.statusRejected,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.statusRejectedMsg,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.6,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (reason != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: AppColors.error.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Text(
                      l10n.rejectionReason(reason!),
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.error,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  onPressed: () {
                    // TODO: Open email or support link
                  },
                  icon: const Icon(Icons.support_agent),
                  label: Text(l10n.contactSupport),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
