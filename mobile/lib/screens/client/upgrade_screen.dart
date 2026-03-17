import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dialectiq/l10n/app_localizations.dart';

import '../../app/theme.dart';
import '../../core/constants.dart';
import '../../providers/payment_provider.dart';
import '../../providers/profile_provider.dart';
import '../../widgets/animated_glass_background.dart';
import '../../widgets/fade_slide_in.dart';
import '../../widgets/gradient_button.dart';

class UpgradeScreen extends ConsumerStatefulWidget {
  const UpgradeScreen({super.key});

  @override
  ConsumerState<UpgradeScreen> createState() => _UpgradeScreenState();
}

class _UpgradeScreenState extends ConsumerState<UpgradeScreen> {
  String? _selectedPackage;

  static const _packageOrder = ['basic', 'advanced', 'enterprise'];

  static const _packageIcons = {
    'basic': Icons.star_outline,
    'advanced': Icons.star_half,
    'enterprise': Icons.star,
  };

  static const _packageColors = {
    'basic': AppColors.accentStart,
    'advanced': AppColors.accentEnd,
    'enterprise': AppColors.warning,
  };

  String? get _currentPackage {
    return ref.read(tenantProvider)?.package;
  }

  List<String> get _availableUpgrades {
    final current = _currentPackage;
    if (current == null) return [];
    final currentIdx = _packageOrder.indexOf(current);
    if (currentIdx < 0 || currentIdx >= _packageOrder.length - 1) return [];
    return _packageOrder.sublist(currentIdx + 1);
  }

  String _packageName(String key, AppLocalizations l10n) {
    switch (key) {
      case 'basic':
        return l10n.packageBasic;
      case 'advanced':
        return l10n.packageAdvanced;
      case 'enterprise':
        return l10n.packageEnterprise;
      default:
        return key;
    }
  }

  Future<void> _requestUpgrade() async {
    if (_selectedPackage == null) return;

    final result = await ref
        .read(paymentProvider.notifier)
        .requestUpgrade(_selectedPackage!);

    if (result != null && mounted) {
      context.push('/upgrade-payment?invoice_id=${result.invoiceId}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final payment = ref.watch(paymentProvider);
    final current = _currentPackage ?? 'basic';
    final upgrades = _availableUpgrades;

    return Scaffold(
      backgroundColor: AppColors.bgStart,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(l10n.upgradeTitle),
      ),
      body: AnimatedGlassBackground(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            // Subtitle
            FadeSlideIn(
              child: Text(
                l10n.upgradeSubtitle,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 24),

            // Current package card (non-selectable)
            FadeSlideIn(
              delay: const Duration(milliseconds: 100),
              child: _buildPackageCard(
                packageKey: current,
                l10n: l10n,
                isCurrent: true,
                isSelected: false,
                onTap: null,
              ),
            ),

            // Arrow indicator
            const FadeSlideIn(
              delay: Duration(milliseconds: 200),
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Center(
                  child: Icon(
                    Icons.arrow_downward_rounded,
                    color: AppColors.accentStart,
                    size: 28,
                  ),
                ),
              ),
            ),

            // Available upgrade cards
            ...upgrades.asMap().entries.map((entry) {
              final idx = entry.key;
              final pkg = entry.value;
              return FadeSlideIn(
                delay: Duration(milliseconds: 300 + idx * 150),
                child: _buildPackageCard(
                  packageKey: pkg,
                  l10n: l10n,
                  isCurrent: false,
                  isSelected: _selectedPackage == pkg,
                  onTap: () => setState(() => _selectedPackage = pkg),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Upgrade button
            if (_selectedPackage != null)
              FadeSlideIn(
                delay: const Duration(milliseconds: 500),
                child: GradientButton(
                  label: l10n.upgradeButton(
                      _packageName(_selectedPackage!, l10n)),
                  icon: Icons.upgrade,
                  isLoading: payment.isLoading,
                  onPressed: _requestUpgrade,
                ),
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
                  style: const TextStyle(
                      color: AppColors.error, fontSize: 13),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPackageCard({
    required String packageKey,
    required AppLocalizations l10n,
    required bool isCurrent,
    required bool isSelected,
    required VoidCallback? onTap,
  }) {
    final name = _packageName(packageKey, l10n);
    final price = packagePrices[packageKey]!;
    final maxBiz = packageLimits[packageKey]!['max_businesses']!;
    final maxReviews = packageLimits[packageKey]!['max_reviews']!;
    final icon = _packageIcons[packageKey]!;
    final color = _packageColors[packageKey]!;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: isSelected
                  ? BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          color.withValues(alpha: 0.20),
                          color.withValues(alpha: 0.08),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: color.withValues(alpha: 0.40),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.20),
                          blurRadius: 20,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    )
                  : isCurrent
                      ? BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.04),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.10),
                          ),
                        )
                      : AppColors.glassDecoration(radius: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              color.withValues(alpha: isCurrent ? 0.12 : 0.25),
                              color.withValues(alpha: isCurrent ? 0.05 : 0.10),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: isCurrent
                              ? null
                              : [
                                  BoxShadow(
                                    color: color.withValues(alpha: 0.20),
                                    blurRadius: 10,
                                  ),
                                ],
                        ),
                        child: Icon(icon,
                            color: isCurrent
                                ? color.withValues(alpha: 0.50)
                                : color),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          name,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isCurrent
                                ? AppColors.textSecondary
                                : AppColors.textPrimary,
                          ),
                        ),
                      ),
                      if (isCurrent)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.15),
                            ),
                          ),
                          child: Text(
                            l10n.currentPackage,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textMuted,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      if (isSelected)
                        Icon(Icons.check_circle, color: color),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    '${price.toInt()} ${l10n.sarMonth}',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isCurrent
                          ? AppColors.textMuted
                          : color,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _featureRow(Icons.business, l10n.maxBusinesses(maxBiz),
                      isCurrent: isCurrent),
                  const SizedBox(height: 6),
                  _featureRow(Icons.rate_review, l10n.maxReviews(maxReviews),
                      isCurrent: isCurrent),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _featureRow(IconData icon, String text, {bool isCurrent = false}) {
    return Row(
      children: [
        Icon(icon,
            size: 16,
            color: isCurrent ? AppColors.textMuted : AppColors.textSecondary),
        const SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            fontSize: 13,
            color: isCurrent ? AppColors.textMuted : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
