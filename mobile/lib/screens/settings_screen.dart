import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../app/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/locale_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final profile = ref.watch(profileProvider);
    final tenant = ref.watch(tenantProvider);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      backgroundColor: AppColors.bgStart,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(l10n.settings),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.bgGradient),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Profile section
            if (profile != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: AppColors.glassDecoration(radius: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                gradient: AppColors.gradient,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.accentStart
                                        .withValues(alpha: 0.25),
                                    blurRadius: 16,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  profile.fullName.isNotEmpty
                                      ? profile.fullName[0].toUpperCase()
                                      : '?',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 22,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    profile.fullName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 17,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    profile.email,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (tenant != null) ...[
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(vertical: 14),
                            child: Divider(
                              color:
                                  Colors.white.withValues(alpha: 0.10),
                            ),
                          ),
                          _infoRow(l10n.businessName, tenant.nameAr),
                          _infoRow(l10n.phone, tenant.phone),
                          _infoRow(
                              l10n.package, tenant.package.toUpperCase()),
                          _infoRow(l10n.status, tenant.status),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Language switcher
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  decoration: AppColors.glassDecoration(radius: 20),
                  child: ListTile(
                    leading: Icon(Icons.language,
                        color: AppColors.accentStart),
                    title: Text(l10n.language,
                        style: const TextStyle(
                            color: AppColors.textPrimary)),
                    trailing: SegmentedButton<String>(
                      segments: [
                        ButtonSegment(
                            value: 'ar', label: Text(l10n.arabic)),
                        ButtonSegment(
                            value: 'en', label: Text(l10n.english)),
                      ],
                      selected: {locale.languageCode},
                      onSelectionChanged: (value) {
                        ref
                            .read(localeProvider.notifier)
                            .setLocale(Locale(value.first));
                      },
                      style: ButtonStyle(
                        visualDensity: VisualDensity.compact,
                      ),
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Logout
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  decoration: AppColors.glassDecoration(radius: 20),
                  child: ListTile(
                    leading:
                        const Icon(Icons.logout, color: AppColors.error),
                    title: Text(
                      l10n.logout,
                      style: const TextStyle(color: AppColors.error),
                    ),
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: AppColors.bgEnd,
                          title: Text(l10n.logout,
                              style: const TextStyle(
                                  color: AppColors.textPrimary)),
                          content: Text(l10n.logoutConfirm,
                              style: const TextStyle(
                                  color: AppColors.textSecondary)),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx),
                              child: Text(l10n.cancel),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(ctx);
                                ref
                                    .read(authProvider.notifier)
                                    .logout();
                                context.go('/login');
                              },
                              child: Text(
                                l10n.confirm,
                                style: const TextStyle(
                                    color: AppColors.error),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Delete Account
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.error.withValues(alpha: 0.20),
                    ),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.delete_forever,
                        color: AppColors.error),
                    title: Text(
                      l10n.deleteAccount,
                      style: const TextStyle(color: AppColors.error),
                    ),
                    subtitle: Text(
                      l10n.deleteAccountDesc,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: AppColors.bgEnd,
                          title: Row(
                            children: [
                              const Icon(Icons.warning_amber_rounded,
                                  color: AppColors.error, size: 28),
                              const SizedBox(width: 8),
                              Expanded(
                                  child: Text(l10n.deleteAccount,
                                      style: const TextStyle(
                                          color:
                                              AppColors.textPrimary))),
                            ],
                          ),
                          content: Text(l10n.deleteAccountConfirm,
                              style: const TextStyle(
                                  color: AppColors.textSecondary)),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx),
                              child: Text(l10n.cancel),
                            ),
                            TextButton(
                              onPressed: () async {
                                Navigator.pop(ctx);
                                final success = await ref
                                    .read(authProvider.notifier)
                                    .deleteAccount();
                                if (success && context.mounted) {
                                  context.go('/login');
                                  ScaffoldMessenger.of(context)
                                      .showSnackBar(
                                    SnackBar(
                                      content: Text(
                                          l10n.deleteAccountSuccess),
                                      backgroundColor:
                                          AppColors.success,
                                    ),
                                  );
                                } else if (context.mounted) {
                                  ScaffoldMessenger.of(context)
                                      .showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        ref
                                                .read(authProvider)
                                                .error ??
                                            l10n.error,
                                      ),
                                      backgroundColor: AppColors.error,
                                    ),
                                  );
                                }
                              },
                              child: Text(
                                l10n.deleteAccountButton,
                                style: const TextStyle(
                                    color: AppColors.error),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
