import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../app/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/locale_provider.dart';
import '../widgets/animated_glass_background.dart';
import '../widgets/fade_slide_in.dart';

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
      body: AnimatedGlassBackground(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Profile section
            if (profile != null) ...[
              FadeSlideIn(
                child: ClipRRect(
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
              ),
              const SizedBox(height: 16),
            ],

            // Upgrade package (only for active non-enterprise tenants)
            if (tenant != null &&
                tenant.status == 'active' &&
                tenant.package != 'enterprise') ...[
              FadeSlideIn(
                delay: const Duration(milliseconds: 50),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      decoration: AppColors.glassDecoration(radius: 20),
                      child: ListTile(
                        leading: Icon(Icons.upgrade,
                            color: AppColors.accentStart),
                        title: Text(l10n.upgradePackage,
                            style: const TextStyle(
                                color: AppColors.textPrimary)),
                        subtitle: Text(l10n.upgradePackageDesc,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            )),
                        trailing: Icon(Icons.arrow_forward_ios,
                            size: 16, color: AppColors.textSecondary),
                        onTap: () => context.push('/upgrade'),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Language switcher
            FadeSlideIn(
              delay: const Duration(milliseconds: 100),
              child: ClipRRect(
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
            ),

            const SizedBox(height: 16),

            // Logout
            FadeSlideIn(
              delay: const Duration(milliseconds: 200),
              child: ClipRRect(
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
            ),

            const SizedBox(height: 16),

            // Delete Account
            FadeSlideIn(
              delay: const Duration(milliseconds: 300),
              child: ClipRRect(
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
                      _showDeleteAccountDialog(context, ref, l10n);
                    },
                  ),
                ),
              ),
            ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDeleteAccountDialog(
      BuildContext context, WidgetRef ref, AppLocalizations l10n) {
    String? selectedReason;
    String otherReasonText = '';
    bool showValidation = false;
    final otherController = TextEditingController();

    final reasons = <String, String>{
      'not_useful': l10n.deleteReasonNotUseful,
      'too_expensive': l10n.deleteReasonTooExpensive,
      'switching_service': l10n.deleteReasonSwitchingService,
      'privacy_concerns': l10n.deleteReasonPrivacyConcerns,
      'technical_issues': l10n.deleteReasonTechnicalIssues,
    };

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            final isOtherSelected = selectedReason == 'other';
            final canDelete = selectedReason != null &&
                (selectedReason != 'other' ||
                    otherReasonText.trim().isNotEmpty);

            String? computedReason() {
              if (selectedReason == null) return null;
              if (selectedReason == 'other') {
                return otherReasonText.trim().isNotEmpty
                    ? otherReasonText.trim()
                    : null;
              }
              return selectedReason;
            }

            return AlertDialog(
              backgroundColor: AppColors.bgEnd,
              insetPadding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              title: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: AppColors.error, size: 28),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(l10n.deleteAccount,
                        style: const TextStyle(
                            color: AppColors.textPrimary)),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Warning text
                    Text(
                      l10n.deleteAccountConfirm,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // "Why are you leaving?" subtitle
                    Text(
                      l10n.deleteReasonTitle,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Predefined reasons
                    ...reasons.entries.map((entry) => _buildReasonTile(
                          label: entry.value,
                          value: entry.key,
                          groupValue: selectedReason,
                          onChanged: (val) {
                            setDialogState(() {
                              selectedReason = val;
                              showValidation = false;
                            });
                          },
                        )),

                    // "Other" option
                    _buildReasonTile(
                      label: l10n.deleteReasonOther,
                      value: 'other',
                      groupValue: selectedReason,
                      onChanged: (val) {
                        setDialogState(() {
                          selectedReason = val;
                          showValidation = false;
                        });
                      },
                    ),

                    // "Other" text field
                    if (isOtherSelected) ...[
                      const SizedBox(height: 8),
                      TextField(
                        controller: otherController,
                        maxLines: 2,
                        maxLength: 500,
                        style:
                            const TextStyle(color: AppColors.textPrimary),
                        decoration: InputDecoration(
                          hintText: l10n.deleteReasonOtherHint,
                          hintStyle:
                              const TextStyle(color: AppColors.textMuted),
                          filled: true,
                          fillColor:
                              Colors.white.withValues(alpha: 0.06),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                                color: Colors.white
                                    .withValues(alpha: 0.15)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                                color: Colors.white
                                    .withValues(alpha: 0.15)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                                color: AppColors.accentStart, width: 2),
                          ),
                          counterStyle:
                              const TextStyle(color: AppColors.textMuted),
                        ),
                        onChanged: (text) {
                          setDialogState(() {
                            otherReasonText = text;
                          });
                        },
                      ),
                    ],

                    // Validation message
                    if (showValidation) ...[
                      const SizedBox(height: 8),
                      Text(
                        l10n.deleteReasonRequired,
                        style: const TextStyle(
                          color: AppColors.error,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(l10n.cancel),
                ),
                TextButton(
                  onPressed: () async {
                    if (!canDelete) {
                      setDialogState(() {
                        showValidation = true;
                      });
                      return;
                    }

                    Navigator.pop(ctx);
                    final success = await ref
                        .read(authProvider.notifier)
                        .deleteAccount(reason: computedReason());
                    if (success && context.mounted) {
                      context.go('/login');
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(l10n.deleteAccountSuccess),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    } else if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            ref.read(authProvider).error ?? l10n.error,
                          ),
                          backgroundColor: AppColors.error,
                        ),
                      );
                    }
                  },
                  child: Text(
                    l10n.deleteAccountButton,
                    style: TextStyle(
                      color: canDelete
                          ? AppColors.error
                          : AppColors.error.withValues(alpha: 0.40),
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  static Widget _buildReasonTile({
    required String label,
    required String value,
    required String? groupValue,
    required ValueChanged<String?> onChanged,
  }) {
    final isSelected = groupValue == value;
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => onChanged(value),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.error.withValues(alpha: 0.08)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? AppColors.error.withValues(alpha: 0.30)
                    : Colors.transparent,
              ),
            ),
            child: Row(
              children: [
                Radio<String>(
                  value: value,
                  groupValue: groupValue,
                  onChanged: onChanged,
                  activeColor: AppColors.error,
                  fillColor: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return AppColors.error;
                    }
                    return AppColors.textMuted;
                  }),
                ),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isSelected
                          ? AppColors.textPrimary
                          : AppColors.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
          ),
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
